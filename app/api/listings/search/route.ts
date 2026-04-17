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

    const allowedCityQueryValues = getCityQueryValues(auth.context.allowedCities);

    const { data, error } = await supabaseAdmin
      .from("listings")
      .select("id, title, city, district, neighborhood")
      .in("city", allowedCityQueryValues)
      .limit(5);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          step: "get_test_query",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "GET test basarili",
      items: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        step: "get_catch",
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
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

    const body = await req.json();

    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const neighborhood = String(body.neighborhood || "").trim();
    const allowedCityQueryValues = getCityQueryValues(auth.context.allowedCities);

    if (city && !isAllowedCity(auth.context, city)) {
      return NextResponse.json(
        { ok: false, error: "Bu il icin erisiminiz yok." },
        { status: 403 }
      );
    }

    let query = supabaseAdmin
      .from("listings")
      .select(
        "id, title, owner_name, phone_number, phone_e164, price, city, district, neighborhood, platform, url, last_message_sent_at, last_message_status, created_at, updated_at"
      )
      .in("city", allowedCityQueryValues)
      .limit(500);

    if (city) {
      query = query.in("city", getCityQueryValues([city]));
    }

    if (district) {
      query = query.eq("district", district);
    }

    if (neighborhood) {
      query = query.eq("neighborhood", neighborhood);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          step: "post_supabase_query",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      items: data || [],
      total: (data || []).length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        step: "post_catch",
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
