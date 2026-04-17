import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import {
  getMaskedPhoneNumberId,
  getWhatsAppConfig,
} from "@/lib/whatsapp-cloud";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedUser(req);

  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const onboardingError = requireCompletedOnboarding(auth.context);

  if (onboardingError) {
    return onboardingError;
  }

  const config = getWhatsAppConfig();

  return NextResponse.json({
    ok: true,
    configured: config.configured,
    mode: config.mode,
    templateConfigured: Boolean(config.templateName),
    templateName: config.templateName,
    templateLanguage: config.templateLanguage,
    phoneNumberId: getMaskedPhoneNumberId(config.phoneNumberId),
    webhookConfigured: Boolean(config.verifyToken),
    recommendedMode:
      config.mode === "template"
        ? "Ilk temas icin uygun"
        : "Yalnizca acik sohbet pencerelerinde guvenli",
  });
}
