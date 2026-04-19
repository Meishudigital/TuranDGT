import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";

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

  const appId =
    process.env.NEXT_PUBLIC_META_APP_ID?.trim() ||
    process.env.META_APP_ID?.trim() ||
    "";
  const configId = process.env.NEXT_PUBLIC_WHATSAPP_EMBEDDED_CONFIG_ID?.trim() || "";
  const graphVersion = process.env.NEXT_PUBLIC_META_GRAPH_VERSION?.trim() || "v23.0";

  return NextResponse.json({
    ok: true,
    enabled: Boolean(appId && configId),
    appId,
    configId,
    graphVersion,
  });
}
