import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { sendCampaignMessage } from "@/lib/whatsapp-cloud";
import {
  getIntegrationConfig,
  getUserWhatsAppIntegration,
  isReadyWhatsAppIntegration,
} from "@/lib/whatsapp-integrations";

export const runtime = "nodejs";

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const compactValue = trimmed.replace(/[\s()-]/g, "");

  if (compactValue.startsWith("00")) {
    return `+${compactValue.slice(2).replace(/[^\d]/g, "")}`;
  }

  if (compactValue.startsWith("+")) {
    return `+${compactValue.slice(1).replace(/[^\d]/g, "")}`;
  }

  return compactValue.replace(/[^\d]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);

    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const onboardingError = requireCompletedOnboarding(auth.context);

    if (onboardingError) {
      return onboardingError;
    }

    const integration = await getUserWhatsAppIntegration(auth.context.user.id);

    if (!isReadyWhatsAppIntegration(integration)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Önce WhatsApp bağlantı bilgilerini eksiksiz kaydet.",
        },
        { status: 400 }
      );
    }

    const config = getIntegrationConfig(integration);

    if (!config) {
      return NextResponse.json(
        {
          ok: false,
          error: "WhatsApp bağlantısı hazır değil.",
        },
        { status: 400 }
      );
    }

    const body = (await req.json()) as {
      phoneNumber?: string;
      messageText?: string;
    };

    const phoneNumber = normalizePhoneNumber(String(body.phoneNumber || ""));
    const messageText = String(body.messageText || "").trim();

    if (!phoneNumber) {
      return NextResponse.json(
        { ok: false, error: "Test için geçerli bir telefon numarası gir." },
        { status: 400 }
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { ok: false, error: "Test için mesaj metni zorunludur." },
        { status: 400 }
      );
    }

    const result = await sendCampaignMessage(
      {
        to: phoneNumber,
        messageText,
      },
      config
    );

    return NextResponse.json({
      ok: true,
      phoneNumber,
      mode: result.mode,
      providerMessageId: result.providerMessageId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Test mesajı gönderilemedi.",
      },
      { status: 500 }
    );
  }
}
