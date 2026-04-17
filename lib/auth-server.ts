import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { UserProfile } from "@/lib/user-data";
import { dedupeSortCities, normalizeCityName } from "@/lib/turkey-cities";

export type AuthenticatedUserContext = {
  user: User;
  profile: UserProfile | null;
  allowedCities: string[];
};

type AuthResult =
  | { context: AuthenticatedUserContext; errorResponse?: never }
  | { context?: never; errorResponse: NextResponse };

function jsonError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

function getBearerToken(req: NextRequest) {
  const authorization = req.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function requireAuthenticatedUser(
  req: NextRequest
): Promise<AuthResult> {
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    return {
      errorResponse: jsonError(401, "Oturum bulunamadi. Lutfen yeniden giris yap."),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return {
      errorResponse: jsonError(401, "Gecersiz oturum. Lutfen yeniden giris yap."),
    };
  }

  const [{ data: profile, error: profileError }, { data: regions, error: regionsError }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle(),
      supabaseAdmin.from("user_regions").select("city").eq("user_id", user.id),
    ]);

  if (profileError || regionsError) {
    return {
      errorResponse: jsonError(
        500,
        profileError?.message || regionsError?.message || "Kullanici verileri alinamadi."
      ),
    };
  }

  return {
    context: {
      user,
      profile: profile || null,
      allowedCities: dedupeSortCities((regions || []).map((item) => item.city)),
    },
  };
}

export function requireCompletedOnboarding(context: AuthenticatedUserContext) {
  if (!context.profile?.onboarding_completed || context.allowedCities.length === 0) {
    return jsonError(403, "Profil ayarlari tamamlanmadi.");
  }

  return null;
}

export function isAllowedCity(
  context: AuthenticatedUserContext,
  city: string | null | undefined
) {
  const normalizedCity = normalizeCityName(city);

  if (!normalizedCity) {
    return true;
  }

  return context.allowedCities.some(
    (allowedCity) => normalizeCityName(allowedCity) === normalizedCity
  );
}
