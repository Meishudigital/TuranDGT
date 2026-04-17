import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getWhatsAppConfig } from "@/lib/whatsapp-cloud";

export const runtime = "nodejs";

type IncomingWebhookStatus = {
  id?: string;
  status?: string;
  errors?: Array<{ message?: string }>;
};

function extractStatuses(payload: unknown): IncomingWebhookStatus[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("entry" in payload) ||
    !Array.isArray(payload.entry)
  ) {
    return [];
  }

  const statuses: IncomingWebhookStatus[] = [];

  for (const entry of payload.entry) {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("changes" in entry) ||
      !Array.isArray(entry.changes)
    ) {
      continue;
    }

    for (const change of entry.changes) {
      if (
        !change ||
        typeof change !== "object" ||
        !("value" in change) ||
        !change.value ||
        typeof change.value !== "object" ||
        !("statuses" in change.value) ||
        !Array.isArray(change.value.statuses)
      ) {
        continue;
      }

      for (const status of change.value.statuses) {
        if (status && typeof status === "object") {
          statuses.push(status as IncomingWebhookStatus);
        }
      }
    }
  }

  return statuses;
}

export async function GET(req: NextRequest) {
  const config = getWhatsAppConfig();
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge") || "";

  if (
    mode === "subscribe" &&
    config.verifyToken &&
    token === config.verifyToken
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false, error: "Webhook dogrulanamadi." }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as unknown;
    const statuses = extractStatuses(payload);

    for (const statusItem of statuses) {
      if (!statusItem.id) {
        continue;
      }

      const nextStatus =
        statusItem.status === "failed"
          ? "failed"
          : statusItem.status === "sent" ||
              statusItem.status === "delivered" ||
              statusItem.status === "read"
            ? "sent"
            : null;

      if (!nextStatus) {
        continue;
      }

      const { error } = await supabaseAdmin
        .from("message_queue")
        .update({
          status: nextStatus,
          provider_status: statusItem.status || null,
          error_message:
            nextStatus === "failed"
              ? statusItem.errors?.[0]?.message || "WhatsApp gonderimi basarisiz oldu."
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq("provider_message_id", statusItem.id);

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Webhook islenemedi.",
      },
      { status: 500 }
    );
  }
}
