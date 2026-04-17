import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const auth = await requireAuthenticatedUser(req);

    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const onboardingError = requireCompletedOnboarding(auth.context);

    if (onboardingError) {
      return onboardingError;
    }

    const { campaignId } = await params;
    const numericCampaignId = Number(campaignId);

    if (!Number.isInteger(numericCampaignId) || numericCampaignId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Gecersiz kampanya numarasi." },
        { status: 400 }
      );
    }

    const { data: ownedCampaign, error: ownedCampaignError } = await supabaseAdmin
      .from("message_campaigns")
      .select("id")
      .eq("id", numericCampaignId)
      .eq("user_id", auth.context.user.id)
      .maybeSingle();

    if (ownedCampaignError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            ownedCampaignError.message.includes("user_id")
              ? "message_campaigns tablosunda user_id kolonu eksik. SQL guncellemesini calistir."
              : ownedCampaignError.message,
        },
        { status: 500 }
      );
    }

    if (!ownedCampaign) {
      return NextResponse.json(
        { ok: false, error: "Bu kampanyaya erisim yok veya kampanya bulunamadi." },
        { status: 404 }
      );
    }

    const { error: queueDeleteError } = await supabaseAdmin
      .from("message_queue")
      .delete()
      .eq("campaign_id", numericCampaignId);

    if (queueDeleteError) {
      return NextResponse.json(
        {
          ok: false,
          error: queueDeleteError.message,
        },
        { status: 500 }
      );
    }

    const { error: campaignDeleteError } = await supabaseAdmin
      .from("message_campaigns")
      .delete()
      .eq("id", numericCampaignId)
      .eq("user_id", auth.context.user.id);

    if (campaignDeleteError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            campaignDeleteError.message.includes("user_id")
              ? "message_campaigns tablosunda user_id kolonu eksik. SQL guncellemesini calistir."
              : campaignDeleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      deletedCampaignId: numericCampaignId,
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
