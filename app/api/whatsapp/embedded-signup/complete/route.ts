import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserWhatsAppIntegration } from "@/lib/whatsapp-integrations";

export const runtime = "nodejs";

type CompletePayload = {
  code?: string;
  wabaId?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  businessName?: string;
  phoneNumberName?: string;
};

function getMetaAppId() {
  return (
    process.env.META_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_META_APP_ID?.trim() ||
    ""
  );
}

function getMetaGraphVersion() {
  return process.env.NEXT_PUBLIC_META_GRAPH_VERSION?.trim() || "v23.0";
}

async function exchangeCodeForAccessToken(code: string) {
  const appId = getMetaAppId();
  const appSecret = process.env.META_APP_SECRET?.trim() || "";
  const graphVersion = getMetaGraphVersion();

  if (!appId || !appSecret) {
    throw new Error("WhatsApp bağlantı kurulumu şu anda kullanılamıyor.");
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/oauth/access_token?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!response.ok || !json.access_token) {
    throw new Error(json.error?.message || "WhatsApp bağlantısı tamamlanamadı.");
  }

  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in || null,
  };
}

async function subscribeAppToWaba(wabaId: string, accessToken: string) {
  const graphVersion = getMetaGraphVersion();

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${wabaId}/subscribed_apps`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const json = (await response.json()) as {
    success?: boolean;
    error?: { message?: string };
  };

  return {
    ok: response.ok && Boolean(json.success),
    error: json.error?.message || null,
  };
}

async function getPhoneDetails(phoneNumberId: string, accessToken: string) {
  const graphVersion = getMetaGraphVersion();
  const query = new URLSearchParams({
    fields: "display_phone_number,verified_name",
  });

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      displayPhoneNumber: "",
      verifiedName: "",
    };
  }

  const json = (await response.json()) as {
    display_phone_number?: string;
    verified_name?: string;
  };

  return {
    displayPhoneNumber: json.display_phone_number || "",
    verifiedName: json.verified_name || "",
  };
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

    const body = (await req.json()) as CompletePayload;
    const code = String(body.code || "").trim();
    const wabaId = String(body.wabaId || "").trim();
    const phoneNumberId = String(body.phoneNumberId || "").trim();

    if (!code) {
      return NextResponse.json(
        {
          ok: false,
          error: "Bağlantı kodu alınamadı. Lütfen yeniden deneyin.",
        },
        { status: 400 }
      );
    }

    if (!wabaId || !phoneNumberId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bağlantı bilgileri tamamlanamadı. Lütfen pencereyi yeniden açıp tekrar deneyin.",
        },
        { status: 400 }
      );
    }

    const tokenResult = await exchangeCodeForAccessToken(code);
    const phoneDetails = await getPhoneDetails(phoneNumberId, tokenResult.accessToken);
    const subscribeResult = await subscribeAppToWaba(wabaId, tokenResult.accessToken);
    const existing = await getUserWhatsAppIntegration(auth.context.user.id);

    const tokenExpiresAt = tokenResult.expiresIn
      ? new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString()
      : null;

    const templateName =
      existing?.templateName || process.env.WHATSAPP_TEMPLATE_NAME?.trim() || null;
    const templateLanguage =
      existing?.templateLanguage ||
      process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() ||
      "tr";

    const { error } = await supabaseAdmin.from("whatsapp_integrations").upsert(
      {
        user_id: auth.context.user.id,
        connection_name: existing?.connectionName || "WhatsApp bağlantısı",
        business_name:
          String(body.businessName || "").trim() ||
          phoneDetails.verifiedName ||
          existing?.businessName ||
          null,
        display_phone_number:
          String(body.displayPhoneNumber || "").trim() ||
          phoneDetails.displayPhoneNumber ||
          existing?.displayPhoneNumber ||
          null,
        waba_id: wabaId,
        phone_number_id: phoneNumberId,
        access_token: tokenResult.accessToken,
        token_expires_at: tokenExpiresAt,
        template_name: templateName,
        template_language: templateLanguage,
        webhook_subscribed: subscribeResult.ok,
        status: subscribeResult.ok ? "connected" : "pending",
        last_error: subscribeResult.ok ? null : subscribeResult.error,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const saved = await getUserWhatsAppIntegration(auth.context.user.id);

    return NextResponse.json({
      ok: true,
      integration: saved,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "WhatsApp bağlantısı tamamlanamadı.",
      },
      { status: 500 }
    );
  }
}
