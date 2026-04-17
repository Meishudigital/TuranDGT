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

    if (!city) {
      return NextResponse.json(
        { ok: false, error: "city zorunlu." },
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
      .select("district")
      .in("city", getCityQueryValues([city]))
      .limit(5000);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          step: "supabase_select_district",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const districts = Array.from(
      new Set(
        (data || [])
          .map((item) => (item.district || "").trim())
          .filter((value) => value.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, "tr"));

    return NextResponse.json({
      ok: true,
      items: districts,
      total: districts.length,
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
