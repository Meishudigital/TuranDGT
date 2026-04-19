import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendCampaignMessage } from "@/lib/whatsapp-cloud";
import {
  getIntegrationConfig,
  getUserWhatsAppIntegration,
  getWhatsAppIntegrationById,
  isReadyWhatsAppIntegration,
} from "@/lib/whatsapp-integrations";

export const runtime = "nodejs";

const BATCH_SIZE = 15;

type QueueRow = {
  id: number;
  phone_number: string | null;
  phone_e164: string | null;
  message_text: string;
  send_attempts: number | null;
};

function normalizePhone(row: QueueRow) {
  return String(row.phone_e164 || row.phone_number || "").trim();
}

async function updateQueueRow(id: number, payload: Record<string, unknown>) {
  const { error } = await supabaseAdmin
    .from("message_queue")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const auth = await requireAuthenticatedUser(req);

    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const onboardingError = requireCompletedOnboarding(auth.context);

    if (onboardingError) {
      return onboardingError;
    }

    const body = (await req.json().catch(() => ({}))) as {
      confirmLiveSend?: boolean;
    };

    if (body.confirmLiveSend !== true) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Canlı gönderim onayı olmadan kampanya başlatılamaz. Önce ekrandaki onay adımını tamamla.",
        },
        { status: 400 }
      );
    }

    const { campaignId } = await params;
    const numericCampaignId = Number(campaignId);

    if (!Number.isInteger(numericCampaignId) || numericCampaignId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Geçersiz kampanya numarası." },
        { status: 400 }
      );
    }

    const { data: ownedCampaign, error: ownedCampaignError } = await supabaseAdmin
      .from("message_campaigns")
      .select("id, integration_id")
      .eq("id", numericCampaignId)
      .eq("user_id", auth.context.user.id)
      .maybeSingle();

    if (ownedCampaignError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            ownedCampaignError.message.includes("user_id")
              ? "message_campaigns tablosunda user_id kolonu eksik. SQL güncellemesini çalıştır."
              : ownedCampaignError.message,
        },
        { status: 500 }
      );
    }

    if (!ownedCampaign) {
      return NextResponse.json(
        { ok: false, error: "Bu kampanyaya erişim yok veya kampanya bulunamadı." },
        { status: 404 }
      );
    }

    const savedIntegration = ownedCampaign.integration_id
      ? await getWhatsAppIntegrationById(ownedCampaign.integration_id, auth.context.user.id)
      : await getUserWhatsAppIntegration(auth.context.user.id);

    if (!savedIntegration || !isReadyWhatsAppIntegration(savedIntegration)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Gönderim için aktif bir WhatsApp bağlantısı bulunamadı.",
        },
        { status: 400 }
      );
    }

    const activeIntegration = savedIntegration;
    const config = getIntegrationConfig(activeIntegration);

    if (!config) {
      return NextResponse.json(
        {
          ok: false,
          error: "WhatsApp bağlantısı hazır değil.",
        },
        { status: 400 }
      );
    }

    if (ownedCampaign.integration_id !== activeIntegration.id) {
      const { error: campaignIntegrationError } = await supabaseAdmin
        .from("message_campaigns")
        .update({
          integration_id: activeIntegration.id,
        })
        .eq("id", numericCampaignId);

      if (campaignIntegrationError) {
        return NextResponse.json(
          {
            ok: false,
            error: campaignIntegrationError.message,
          },
          { status: 500 }
        );
      }
    }

    const { data: queueRows, error: queueError } = await supabaseAdmin
      .from("message_queue")
      .select("id, phone_number, phone_e164, message_text, send_attempts")
      .eq("campaign_id", numericCampaignId)
      .eq("status", "pending")
      .order("id", { ascending: true })
      .limit(BATCH_SIZE);

    if (queueError) {
      return NextResponse.json(
        {
          ok: false,
          error: queueError.message,
        },
        { status: 500 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const row of (queueRows || []) as QueueRow[]) {
      const phone = normalizePhone(row);
      const nextAttemptCount = (row.send_attempts || 0) + 1;

      if (!phone) {
        failedCount += 1;

        await updateQueueRow(row.id, {
          integration_id: activeIntegration.id,
          status: "failed",
          error_message: "Geçerli telefon numarası bulunamadı.",
          provider_status: "failed",
          send_attempts: nextAttemptCount,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        continue;
      }

      try {
        const result = await sendCampaignMessage(
          {
            to: phone,
            messageText: row.message_text,
          },
          config
        );

        sentCount += 1;

        await updateQueueRow(row.id, {
          integration_id: activeIntegration.id,
          status: "sent",
          provider_status: result.mode === "template" ? "template_sent" : "text_sent",
          provider_message_id: result.providerMessageId,
          error_message: null,
          sent_at: new Date().toISOString(),
          send_attempts: nextAttemptCount,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        failedCount += 1;

        await updateQueueRow(row.id, {
          integration_id: activeIntegration.id,
          status: "failed",
          provider_status: "failed",
          error_message:
            error instanceof Error ? error.message : "WhatsApp gönderimi başarısız oldu.",
          send_attempts: nextAttemptCount,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    const { count: remainingCount, error: remainingError } = await supabaseAdmin
      .from("message_queue")
      .select("id", { head: true, count: "exact" })
      .eq("campaign_id", numericCampaignId)
      .eq("status", "pending");

    if (remainingError) {
      return NextResponse.json(
        {
          ok: false,
          error: remainingError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: config.mode,
      processedCount: sentCount + failedCount,
      sentCount,
      failedCount,
      remainingCount: remainingCount || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Kampanya başlatılamadı.",
      },
      { status: 500 }
    );
  }
}
