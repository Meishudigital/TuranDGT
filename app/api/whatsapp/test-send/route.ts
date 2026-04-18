import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { getWhatsAppConfig, sendCampaignMessage } from "@/lib/whatsapp-cloud";

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

    const body = (await req.json()) as {
      phoneNumber?: string;
      messageText?: string;
    };

    const phoneNumber = normalizePhoneNumber(String(body.phoneNumber || ""));
    const messageText = String(body.messageText || "").trim();

    if (!phoneNumber) {
      return NextResponse.json(
        { ok: false, error: "Test icin gecerli bir telefon numarasi gir." },
        { status: 400 }
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { ok: false, error: "Test icin mesaj metni zorunludur." },
        { status: 400 }
      );
    }

    const result = await sendCampaignMessage({
      to: phoneNumber,
      messageText,
    });

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
        error: error instanceof Error ? error.message : "Test mesaji gonderilemedi.",
      },
      { status: 500 }
    );
  }
}
