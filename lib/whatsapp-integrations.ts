import { supabaseAdmin } from "@/lib/supabase-admin";
import type { WhatsAppConfig } from "@/lib/whatsapp-cloud";

type IntegrationRow = {
  id: string;
  user_id: string;
  connection_name: string | null;
  business_name: string | null;
  display_phone_number: string | null;
  waba_id: string | null;
  phone_number_id: string | null;
  access_token: string | null;
  token_expires_at: string | null;
  template_name: string | null;
  template_language: string | null;
  webhook_subscribed: boolean | null;
  status: string | null;
  last_error: string | null;
  updated_at: string | null;
};

export type WhatsAppIntegration = {
  id: string;
  userId: string;
  connectionName: string;
  businessName: string;
  displayPhoneNumber: string;
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  tokenExpiresAt: string | null;
  templateName: string;
  templateLanguage: string;
  webhookSubscribed: boolean;
  status: string;
  lastError: string;
  updatedAt: string | null;
};

function mapRow(row: IntegrationRow | null): WhatsAppIntegration | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    connectionName: row.connection_name || "",
    businessName: row.business_name || "",
    displayPhoneNumber: row.display_phone_number || "",
    wabaId: row.waba_id || "",
    phoneNumberId: row.phone_number_id || "",
    accessToken: row.access_token || "",
    tokenExpiresAt: row.token_expires_at || null,
    templateName: row.template_name || "",
    templateLanguage: row.template_language || "tr",
    webhookSubscribed: Boolean(row.webhook_subscribed),
    status: row.status || "pending",
    lastError: row.last_error || "",
    updatedAt: row.updated_at || null,
  };
}

function baseSelect() {
  return "id, user_id, connection_name, business_name, display_phone_number, waba_id, phone_number_id, access_token, token_expires_at, template_name, template_language, webhook_subscribed, status, last_error, updated_at";
}

export async function getUserWhatsAppIntegration(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("whatsapp_integrations")
    .select(baseSelect())
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapRow((data as IntegrationRow | null) || null);
}

export async function getWhatsAppIntegrationById(integrationId: string, userId?: string) {
  let query = supabaseAdmin
    .from("whatsapp_integrations")
    .select(baseSelect())
    .eq("id", integrationId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return mapRow((data as IntegrationRow | null) || null);
}

export function isReadyWhatsAppIntegration(integration: WhatsAppIntegration | null) {
  return Boolean(
    integration &&
      integration.accessToken &&
      integration.phoneNumberId &&
      integration.status !== "expired" &&
      integration.status !== "error"
  );
}

export function getIntegrationConfig(
  integration: WhatsAppIntegration | null
): WhatsAppConfig | null {
  if (!integration || !isReadyWhatsAppIntegration(integration)) {
    return null;
  }

  return {
    accessToken: integration.accessToken,
    phoneNumberId: integration.phoneNumberId,
    apiVersion: process.env.WHATSAPP_API_VERSION?.trim() || "v23.0",
    templateName: integration.templateName || null,
    templateLanguage: integration.templateLanguage || "tr",
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || null,
    mode: integration.templateName ? "template" : "text",
    configured: true,
  };
}

export function getIntegrationMissingRequirements(integration: WhatsAppIntegration | null) {
  const missing: string[] = [];

  if (!integration) {
    return ["Bağlantı kurulmadı"];
  }

  if (!integration.accessToken) {
    missing.push("Erişim anahtarı");
  }

  if (!integration.phoneNumberId) {
    missing.push("Telefon numarası kimliği");
  }

  if (!integration.webhookSubscribed) {
    missing.push("Webhook bağlantısı");
  }

  return missing;
}
