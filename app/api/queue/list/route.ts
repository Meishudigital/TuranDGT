import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from("message_campaigns")
      .select("id")
      .eq("user_id", auth.context.user.id)
      .limit(500);

    if (campaignsError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            campaignsError.message.includes("user_id")
              ? "message_campaigns tablosunda user_id kolonu eksik. SQL guncellemesini calistir."
              : campaignsError.message,
        },
        { status: 500 }
      );
    }

    const campaignIds = (campaigns || []).map((item) => item.id);

    if (campaignIds.length === 0) {
      return NextResponse.json({
        ok: true,
        items: [],
      });
    }

    const { data, error } = await supabaseAdmin
      .from("message_queue")
      .select(`
        id,
        campaign_id,
        listing_id,
        phone_number,
        phone_e164,
        owner_name,
        message_text,
        status,
        provider_status,
        error_message,
        sent_at,
        created_at,
        updated_at,
        message_campaigns (
          id,
          name
        )
      `)
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      items: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
