"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import QueueTable, { type QueueItem } from "@/components/QueueTable";
import { fetchWithSession } from "@/lib/auth-client";

type Props = {
  session: Session;
};

type WhatsAppStatus = {
  configured: boolean;
  mode: "text" | "template";
  templateConfigured: boolean;
  templateName: string | null;
  templateLanguage: string;
  phoneNumberId: string;
  webhookConfigured: boolean;
  missingRequirements: string[];
  optionalRecommendations: string[];
  recommendedMode: string;
};

async function fetchQueueItems(session: Session) {
  const res = await fetchWithSession(session, "/api/queue/list");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Queue verileri alinamadi.");
  }

  return (json.items || []) as QueueItem[];
}

async function fetchWhatsAppStatus(session: Session) {
  const res = await fetchWithSession(session, "/api/whatsapp/status");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "WhatsApp durumu alinamadi.");
  }

  return json as WhatsAppStatus & { ok: true };
}

export default function AutomationPanel({ session }: Props) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setErrorText("");

        const [nextStatus, nextItems] = await Promise.all([
          fetchWhatsAppStatus(session),
          fetchQueueItems(session),
        ]);

        if (!active) {
          return;
        }

        setStatus(nextStatus);
        setItems(nextItems);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorText(
          error instanceof Error ? error.message : "Otomasyon verileri alinamadi."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [session]);

  const pendingCount = useMemo(() => {
    return items.filter((item) => item.status === "pending").length;
  }, [items]);

  const failedCount = useMemo(() => {
    return items.filter((item) => item.status === "failed").length;
  }, [items]);

  const missingRequirements = status?.missingRequirements || [];
  const optionalRecommendations = status?.optionalRecommendations || [];
  const hasMissingRequirements = missingRequirements.length > 0;

  return (
    <div className="space-y-5">
      {errorText && <div className="info-banner info-banner--error">{errorText}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_340px]">
        <section className="surface-card rounded-[1.65rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="section-kicker">WhatsApp Cloud API</p>
              <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                Gonderim durumu
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                Kurulum ve queue akisini tek ekranda takip et.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[29rem]">
              <div className="compact-stat">
                <p className="compact-stat__label">Durum</p>
                <p className="compact-stat__value">
                  {status?.configured ? "Hazir" : loading ? "Kontrol" : "Eksik"}
                </p>
              </div>

              <div className="compact-stat">
                <p className="compact-stat__label">Bekleyen queue</p>
                <p className="compact-stat__value">{pendingCount}</p>
              </div>

              <div className="compact-stat">
                <p className="compact-stat__label">Basarisiz</p>
                <p className="compact-stat__value">{failedCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="compact-stat">
              <p className="compact-stat__label">Mod</p>
              <p className="compact-stat__value">
                {status?.mode === "template" ? "Template" : "Text"}
              </p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Template</p>
              <p className="compact-stat__value">
                {status?.templateName || "Yok"}
              </p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Webhook</p>
              <p className="compact-stat__value">
                {status?.webhookConfigured ? "Hazir" : "Eksik"}
              </p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Phone ID</p>
              <p className="compact-stat__value">{status?.phoneNumberId || "-"}</p>
            </div>
          </div>

          <div className="surface-subcard mt-5 rounded-[1.35rem] p-4">
            <p className="field-label mb-2">Yorum</p>
            <p className="text-sm leading-6 text-[var(--text-2)]">
              {status?.recommendedMode || (loading ? "Yukleniyor..." : "-")}
            </p>
          </div>
        </section>

        <aside className="surface-card rounded-[1.65rem] p-4">
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="section-kicker">Kurulum Kontrolu</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                {hasMissingRequirements ? "Eksik Ayarlar" : "Kurulum Tamam"}
              </h2>
            </div>

            {loading ? (
              <div className="compact-stat">
                <p className="compact-stat__label">Durum</p>
                <p className="compact-stat__value">Kontrol ediliyor</p>
              </div>
            ) : hasMissingRequirements ? (
              <>
                {missingRequirements.map((item, index) => (
                  <div className="compact-stat" key={item}>
                    <p className="compact-stat__label">{index + 1}</p>
                    <p className="compact-stat__value">{item}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className="surface-subcard rounded-[1.2rem] p-4">
                <p className="field-label mb-2">Durum</p>
                <p className="text-base font-medium text-[var(--text-0)]">
                  Zorunlu ayarlar hazir.
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                  Gonderim testine hazir.
                </p>
              </div>
            )}

            {!loading && optionalRecommendations.length > 0 ? (
              <div className="surface-subcard rounded-[1.2rem] p-4">
                <p className="field-label mb-2">Onerilen</p>
                <div className="space-y-2">
                  {optionalRecommendations.map((item) => (
                    <p className="text-sm text-[var(--text-1)]" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {loading ? (
        <div className="surface-card rounded-[1.65rem] p-5 text-[var(--text-1)]">
          Otomasyon verileri yukleniyor...
        </div>
      ) : (
        <QueueTable items={items} />
      )}
    </div>
  );
}
