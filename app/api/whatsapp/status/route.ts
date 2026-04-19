import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import {
  getIntegrationConfig,
  getIntegrationMissingRequirements,
  getUserWhatsAppIntegration,
  isReadyWhatsAppIntegration,
} from "@/lib/whatsapp-integrations";
import { getMaskedPhoneNumberId } from "@/lib/whatsapp-cloud";

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

  const integration = await getUserWhatsAppIntegration(auth.context.user.id);
  const config = getIntegrationConfig(integration);
  const missingRequirements = getIntegrationMissingRequirements(integration);
  const templateName = integration?.templateName || null;

  return NextResponse.json({
    ok: true,
    configured: isReadyWhatsAppIntegration(integration),
    mode: config?.mode || "text",
    templateConfigured: Boolean(templateName),
    templateName,
    templateLanguage: integration?.templateLanguage || "tr",
    phoneNumberId: getMaskedPhoneNumberId(integration?.phoneNumberId || ""),
    webhookConfigured: Boolean(integration?.webhookSubscribed),
    missingRequirements,
    optionalRecommendations: templateName ? [] : ["Şablon adı"],
    recommendedMode: templateName
      ? "İlk temas için uygun"
      : "İlk gönderim için şablon eklemen önerilir",
  });
}
