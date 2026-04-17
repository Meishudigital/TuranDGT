import { NextRequest, NextResponse } from "next/server";
import {
  requireAuthenticatedUser,
  requireCompletedOnboarding,
} from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCityQueryValues } from "@/lib/turkey-cities";

export const runtime = "nodejs";

type SelectedListing = {
  id: string;
  owner_name: string | null;
  phone_number: string | null;
  phone_e164: string | null;
};

type ScopedListing = {
  id: string;
  owner_name: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  city: string | null;
};

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

    const campaignName = String(body.campaignName || "").trim();
    const messageTemplate = String(body.messageTemplate || "").trim();
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const neighborhood = String(body.neighborhood || "").trim();
    const selectedListings = Array.isArray(body.selectedListings)
      ? (body.selectedListings as SelectedListing[])
      : [];

    if (!campaignName) {
      return NextResponse.json(
        { ok: false, error: "Kampanya adi zorunlu." },
        { status: 400 }
      );
    }

    if (!messageTemplate) {
      return NextResponse.json(
        { ok: false, error: "Mesaj metni zorunlu." },
        { status: 400 }
      );
    }

    if (selectedListings.length === 0) {
      return NextResponse.json(
        { ok: false, error: "En az 1 kayit secmelisin." },
        { status: 400 }
      );
    }

    const selectedIds = Array.from(
      new Set(
        selectedListings
          .map((item) => String(item.id || "").trim())
          .filter((item) => item.length > 0)
      )
    );
    const allowedCityQueryValues = getCityQueryValues(auth.context.allowedCities);

    const { data: listingRows, error: listingsError } = await supabaseAdmin
      .from("listings")
      .select("id, owner_name, phone_number, phone_e164, city")
      .in("id", selectedIds)
      .in("city", allowedCityQueryValues);

    if (listingsError) {
      return NextResponse.json(
        {
          ok: false,
          step: "listing_scope",
          error: listingsError.message,
        },
        { status: 500 }
      );
    }

    const uniqueListingsByPhone = new Map<string, ScopedListing>();

    for (const item of (listingRows || []) as ScopedListing[]) {
      const phone = String(item.phone_e164 || item.phone_number || "").trim();

      if (!item.id || !phone || uniqueListingsByPhone.has(phone)) {
        continue;
      }

      uniqueListingsByPhone.set(phone, item);
    }

    const validListings = Array.from(uniqueListingsByPhone.values());

    if (validListings.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Gecerli telefon numarasi olan kayit bulunamadi." },
        { status: 400 }
      );
    }

    const { data: campaignData, error: campaignError } = await supabaseAdmin
      .from("message_campaigns")
      .insert({
        user_id: auth.context.user.id,
        name: campaignName,
        message_template: messageTemplate,
        city: city || null,
        district: district || null,
        neighborhood: neighborhood || null,
      })
      .select("id")
      .single();

    if (campaignError || !campaignData) {
      return NextResponse.json(
        {
          ok: false,
          step: "campaign_insert",
          error:
            campaignError?.message?.includes("user_id")
              ? "message_campaigns tablosunda user_id kolonu eksik. SQL guncellemesini calistir."
              : campaignError?.message || "Kampanya olusturulamadi.",
        },
        { status: 500 }
      );
    }

    const queueRows = validListings.map((item) => ({
      campaign_id: campaignData.id,
      listing_id: item.id,
      phone_number: String(item.phone_number || item.phone_e164 || "").trim(),
      phone_e164: String(item.phone_e164 || "").trim() || null,
      owner_name: item.owner_name || null,
      message_text: messageTemplate,
      status: "pending",
    }));

    const { error: queueError } = await supabaseAdmin
      .from("message_queue")
      .insert(queueRows);

    if (queueError) {
      return NextResponse.json(
        {
          ok: false,
          step: "queue_insert",
          error: queueError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      campaignId: campaignData.id,
      queuedCount: queueRows.length,
      message: "Kampanya ve queue kayitlari olusturuldu.",
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
