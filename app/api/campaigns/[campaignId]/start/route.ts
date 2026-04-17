import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getWhatsAppConfig, sendCampaignMessage } from "@/lib/whatsapp-cloud";

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

    const config = getWhatsAppConfig();

    if (!config.configured) {
      return NextResponse.json(
        {
          ok: false,
          error: "WhatsApp Cloud API ayarlari eksik.",
        },
        { status: 400 }
      );
    }

    const { campaignId } = await params;
    const numericCampaignId = Number(campaignId);

    if (!Number.isInteger(numericCampaignId) || numericCampaignId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Gecersiz kampanya numarasi." },
        { status: 400 }
      );
    }

    const { data: ownedCampaign, error: ownedCampaignError } = await supabaseAdmin
      .from("message_campaigns")
      .select("id")
      .eq("id", numericCampaignId)
      .eq("user_id", auth.context.user.id)
      .maybeSingle();

    if (ownedCampaignError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            ownedCampaignError.message.includes("user_id")
              ? "message_campaigns tablosunda user_id kolonu eksik. SQL guncellemesini calistir."
              : ownedCampaignError.message,
        },
        { status: 500 }
      );
    }

    if (!ownedCampaign) {
      return NextResponse.json(
        { ok: false, error: "Bu kampanyaya erisim yok veya kampanya bulunamadi." },
        { status: 404 }
      );
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
          status: "failed",
          error_message: "Gecerli telefon numarasi bulunamadi.",
          provider_status: "failed",
          send_attempts: nextAttemptCount,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        continue;
      }

      try {
        const result = await sendCampaignMessage({
          to: phone,
          messageText: row.message_text,
        });

        sentCount += 1;

        await updateQueueRow(row.id, {
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
          status: "failed",
          provider_status: "failed",
          error_message:
            error instanceof Error ? error.message : "WhatsApp gonderimi basarisiz oldu.",
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
        error: error instanceof Error ? error.message : "Kampanya baslatilamadi.",
      },
      { status: 500 }
    );
  }
}
