import { NextRequest, NextResponse } from "next/server";
import {
  isAllowedCity,
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCityQueryValues } from "@/lib/turkey-cities";

export const runtime = "nodejs";

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

    const city = req.nextUrl.searchParams.get("city")?.trim();
    const district = req.nextUrl.searchParams.get("district")?.trim();

    if (!city || !district) {
      return NextResponse.json(
        { ok: false, error: "city ve district zorunlu." },
        { status: 400 }
      );
    }

    if (!isAllowedCity(auth.context, city)) {
      return NextResponse.json(
        { ok: false, error: "Bu il icin erisiminiz yok." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("listings")
      .select("neighborhood")
      .in("city", getCityQueryValues([city]))
      .eq("district", district)
      .limit(5000);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          step: "supabase_select_neighborhood",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const neighborhoods = Array.from(
      new Set(
        (data || [])
          .map((item) => (item.neighborhood || "").trim())
          .filter((value) => value.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, "tr"));

    return NextResponse.json({
      ok: true,
      items: neighborhoods,
      total: neighborhoods.length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        step: "catch",
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
