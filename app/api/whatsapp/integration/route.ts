import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

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

function maskValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value.length <= 4) {
    return value;
  }

  return `...${value.slice(-4)}`;
}

function serializeIntegration(row: IntegrationRow | null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    connectionName: row.connection_name || "",
    businessName: row.business_name || "",
    displayPhoneNumber: row.display_phone_number || "",
    wabaId: row.waba_id || "",
    phoneNumberId: row.phone_number_id || "",
    maskedPhoneNumberId: maskValue(row.phone_number_id),
    hasAccessToken: Boolean(row.access_token),
    tokenExpiresAt: row.token_expires_at,
    templateName: row.template_name || "",
    templateLanguage: row.template_language || "tr",
    webhookSubscribed: Boolean(row.webhook_subscribed),
    status: row.status || "pending",
    lastError: row.last_error || "",
    updatedAt: row.updated_at,
  };
}

async function getIntegration(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("whatsapp_integrations")
    .select(
      "id, user_id, connection_name, business_name, display_phone_number, waba_id, phone_number_id, access_token, token_expires_at, template_name, template_language, webhook_subscribed, status, last_error, updated_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as IntegrationRow | null) || null;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);

    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const onboardingError = requireCompletedOnboarding(auth.context);

    if (onboardingError) {
      return onboardingError;
    }

    const integration = await getIntegration(auth.context.user.id);

    return NextResponse.json({
      ok: true,
      integration: serializeIntegration(integration),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "WhatsApp bağlantısı alınamadı.",
      },
      { status: 500 }
    );
  }
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

    const body = (await req.json()) as {
      connectionName?: string;
      businessName?: string;
      displayPhoneNumber?: string;
      wabaId?: string;
      phoneNumberId?: string;
      accessToken?: string;
      tokenExpiresAt?: string;
      templateName?: string;
      templateLanguage?: string;
      webhookSubscribed?: boolean;
    };

    const existing = await getIntegration(auth.context.user.id);

    const nextConnectionName = body.connectionName?.trim() || null;
    const nextBusinessName = body.businessName?.trim() || null;
    const nextDisplayPhoneNumber = body.displayPhoneNumber?.trim() || null;
    const nextWabaId = body.wabaId?.trim() || null;
    const nextPhoneNumberId = body.phoneNumberId?.trim() || null;
    const nextAccessToken = body.accessToken?.trim() || existing?.access_token || null;
    const nextTemplateName = body.templateName?.trim() || null;
    const nextTemplateLanguage = body.templateLanguage?.trim() || "tr";
    const nextTokenExpiresAt = body.tokenExpiresAt?.trim() || null;
    const nextWebhookSubscribed = Boolean(body.webhookSubscribed);

    const nextStatus =
      nextAccessToken && nextPhoneNumberId ? "connected" : existing?.status || "pending";

    const payload = {
      user_id: auth.context.user.id,
      connection_name: nextConnectionName,
      business_name: nextBusinessName,
      display_phone_number: nextDisplayPhoneNumber,
      waba_id: nextWabaId,
      phone_number_id: nextPhoneNumberId,
      access_token: nextAccessToken,
      token_expires_at: nextTokenExpiresAt,
      template_name: nextTemplateName,
      template_language: nextTemplateLanguage,
      webhook_subscribed: nextWebhookSubscribed,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("whatsapp_integrations")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const savedIntegration = await getIntegration(auth.context.user.id);

    return NextResponse.json({
      ok: true,
      integration: serializeIntegration(savedIntegration),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "WhatsApp bağlantısı kaydedilemedi.",
      },
      { status: 500 }
    );
  }
}
