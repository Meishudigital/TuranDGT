type WhatsAppSendMode = "text" | "template";

export type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  apiVersion: string;
  templateName: string | null;
  templateLanguage: string;
  verifyToken: string | null;
  mode: WhatsAppSendMode;
  configured: boolean;
};

type SendCampaignMessageInput = {
  to: string;
  messageText: string;
};

type SendCampaignMessageResult = {
  providerMessageId: string | null;
  mode: WhatsAppSendMode;
  rawResponse: unknown;
};

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const accessToken = readEnv("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = readEnv("WHATSAPP_PHONE_NUMBER_ID");
  const apiVersion = readEnv("WHATSAPP_API_VERSION") || "v23.0";
  const templateName = readEnv("WHATSAPP_TEMPLATE_NAME") || null;
  const templateLanguage = readEnv("WHATSAPP_TEMPLATE_LANGUAGE") || "tr";
  const verifyToken = readEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN") || null;

  return {
    accessToken,
    phoneNumberId,
    apiVersion,
    templateName,
    templateLanguage,
    verifyToken,
    mode: templateName ? "template" : "text",
    configured: Boolean(accessToken && phoneNumberId),
  };
}

export function getMaskedPhoneNumberId(phoneNumberId: string) {
  if (!phoneNumberId) {
    return "-";
  }

  if (phoneNumberId.length <= 4) {
    return phoneNumberId;
  }

  return `...${phoneNumberId.slice(-4)}`;
}

function getErrorMessage(responseBody: unknown, fallbackMessage: string) {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "error" in responseBody &&
    typeof responseBody.error === "object" &&
    responseBody.error !== null &&
    "message" in responseBody.error &&
    typeof responseBody.error.message === "string"
  ) {
    return responseBody.error.message;
  }

  return fallbackMessage;
}

export async function sendCampaignMessage(
  input: SendCampaignMessageInput,
  overrideConfig?: WhatsAppConfig | null
): Promise<SendCampaignMessageResult> {
  const config = overrideConfig || getWhatsAppConfig();

  if (!config.configured) {
    throw new Error("WhatsApp Cloud API ayarlari eksik.");
  }

  const endpoint = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
  const payload = config.templateName
    ? {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: input.to,
        type: "template",
        template: {
          name: config.templateName,
          language: {
            code: config.templateLanguage,
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: input.messageText,
                },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: input.to,
        type: "text",
        text: {
          preview_url: false,
          body: input.messageText,
        },
      };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const responseBody = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(getErrorMessage(responseBody, "WhatsApp mesaji gonderilemedi."));
  }

  let providerMessageId: string | null = null;

  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "messages" in responseBody &&
    Array.isArray(responseBody.messages) &&
    responseBody.messages[0] &&
    typeof responseBody.messages[0] === "object" &&
    responseBody.messages[0] !== null &&
    "id" in responseBody.messages[0] &&
    typeof responseBody.messages[0].id === "string"
  ) {
    providerMessageId = responseBody.messages[0].id;
  }

  return {
    providerMessageId,
    mode: config.mode,
    rawResponse: responseBody,
  };
}
