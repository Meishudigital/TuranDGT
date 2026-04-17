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
  const missingRequirements: string[] = [];
  const optionalRecommendations: string[] = [];

  if (!config.accessToken) {
    missingRequirements.push("WHATSAPP_ACCESS_TOKEN");
  }

  if (!config.phoneNumberId) {
    missingRequirements.push("WHATSAPP_PHONE_NUMBER_ID");
  }

  if (!config.verifyToken) {
    missingRequirements.push("WHATSAPP_WEBHOOK_VERIFY_TOKEN");
  }

  if (!config.templateName) {
    optionalRecommendations.push("WHATSAPP_TEMPLATE_NAME");
  }

  return NextResponse.json({
    ok: true,
    configured: config.configured,
    mode: config.mode,
    templateConfigured: Boolean(config.templateName),
    templateName: config.templateName,
    templateLanguage: config.templateLanguage,
    phoneNumberId: getMaskedPhoneNumberId(config.phoneNumberId),
    webhookConfigured: Boolean(config.verifyToken),
    missingRequirements,
    optionalRecommendations,
    recommendedMode:
      config.mode === "template"
        ? "Ilk temas icin uygun"
        : "Yalnizca acik sohbet pencerelerinde guvenli",
  });
}
