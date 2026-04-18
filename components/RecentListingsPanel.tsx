"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { fetchWithSession } from "@/lib/auth-client";

type RecentListing = {
  id: string;
  title: string | null;
  owner_name: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  price: number | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  platform: string | null;
  url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  session: Session;
};

function formatPrice(price: number | null) {
  if (price == null) {
    return "-";
  }

  return `TL ${new Intl.NumberFormat("tr-TR").format(price)}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function RecentListingsPanel({ session }: Props) {
  const [items, setItems] = useState<RecentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let active = true;

    const loadRecentListings = async () => {
      try {
        setLoading(true);
        setErrorText("");

        const res = await fetchWithSession(session, "/api/listings/recent");
        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.error || "Yeni ilanlar alinamadi.");
        }

        if (!active) {
          return;
        }

        setItems(json.items || []);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorText(error instanceof Error ? error.message : "Yeni ilanlar alinamadi.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRecentListings();

    return () => {
      active = false;
    };
  }, [session]);

  const cityCount = useMemo(() => {
    return new Set(items.map((item) => item.city).filter(Boolean)).size;
  }, [items]);

  return (
    <div className="space-y-5">
      {errorText && <div className="info-banner info-banner--error">{errorText}</div>}

      <section className="surface-card rounded-[1.65rem] p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="section-kicker">Yeni Ilanlar</p>
            <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Son eklenenler
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
              Yetkili alanlar icindeki son kayitlar.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[29rem]">
            <div className="compact-stat">
              <p className="compact-stat__label">Toplam kayit</p>
              <p className="compact-stat__value">{items.length}</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Il sayisi</p>
              <p className="compact-stat__value">{cityCount}</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Durum</p>
              <p className="compact-stat__value">{loading ? "Yukleniyor" : "Hazir"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="table-shell">
        <div className="table-top">
          <div className="max-w-2xl">
            <p className="section-kicker">Liste</p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Son 100 ilan
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
              En yeni kayitlar ustte.
            </p>
          </div>
        </div>

        <div className="thin-scroll overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/20 text-left">
              <tr>
                <th className="table-head-cell min-w-[300px]">Ilan</th>
                <th className="table-head-cell min-w-[180px]">Kisi</th>
                <th className="table-head-cell min-w-[220px]">Konum</th>
                <th className="table-head-cell min-w-[140px]">Fiyat</th>
                <th className="table-head-cell min-w-[180px]">Eklenme</th>
                <th className="table-head-cell min-w-[120px]">Link</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="table-cell">
                    <div className="space-y-2">
                      <p className="table-title text-[0.98rem] font-semibold">
                        {item.title || "Baslik bulunamadi"}
                      </p>
                      <span className="table-meta-pill">{item.platform || "Platform yok"}</span>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <p className="table-cell--strong">{item.owner_name || "-"}</p>
                      <p className="table-cell--muted text-sm">
                        {item.phone_number || item.phone_e164 || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell">
                    <p className="table-cell--strong">{item.city || "-"}</p>
                    <p className="table-cell--muted mt-1 text-sm leading-6">
                      {[item.district, item.neighborhood].filter(Boolean).join(" / ") || "-"}
                    </p>
                  </td>

                  <td className="table-cell table-cell--strong">{formatPrice(item.price)}</td>

                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <p className="table-cell--strong">{formatDate(item.created_at)}</p>
                      <p className="table-cell--muted text-sm">
                        {formatDate(item.updated_at)}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-btn px-3.5 py-2 text-sm"
                      >
                        Ilani Ac
                      </a>
                    ) : (
                      <span className="table-cell--muted">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Gosterilecek yeni ilan bulunamadi.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Yeni ilanlar yukleniyor...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
