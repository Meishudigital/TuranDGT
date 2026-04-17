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
      .select("id, user_id, name, message_template, city, district, neighborhood")
      .eq("user_id", auth.context.user.id)
      .order("id", { ascending: false })
      .limit(200);

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

    const { data: queueRows, error: queueError } = await supabaseAdmin
      .from("message_queue")
      .select("campaign_id, status")
      .in("campaign_id", campaignIds);

    if (queueError) {
      return NextResponse.json(
        {
          ok: false,
          error: queueError.message,
        },
        { status: 500 }
      );
    }

    const summaryByCampaign = new Map<
      number,
      { total: number; pending: number; sent: number; failed: number }
    >();

    for (const row of queueRows || []) {
      if (typeof row.campaign_id !== "number") {
        continue;
      }

      const current = summaryByCampaign.get(row.campaign_id) || {
        total: 0,
        pending: 0,
        sent: 0,
        failed: 0,
      };

      current.total += 1;

      if (row.status === "pending") {
        current.pending += 1;
      } else if (row.status === "sent") {
        current.sent += 1;
      } else if (row.status === "failed") {
        current.failed += 1;
      }

      summaryByCampaign.set(row.campaign_id, current);
    }

    return NextResponse.json({
      ok: true,
      items: (campaigns || []).map((item) => {
        const summary = summaryByCampaign.get(item.id) || {
          total: 0,
          pending: 0,
          sent: 0,
          failed: 0,
        };

        return {
          ...item,
          total_count: summary.total,
          pending_count: summary.pending,
          sent_count: summary.sent,
          failed_count: summary.failed,
        };
      }),
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
