"use client";

import type { Session } from "@supabase/supabase-js";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import QueueTable, { type QueueItem } from "@/components/QueueTable";
import { fetchWithSession } from "@/lib/auth-client";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          status?: string;
          authResponse?: { code?: string };
        }) => void,
        options?: Record<string, unknown>
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

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

type IntegrationSummary = {
  id: string;
  connectionName: string;
  businessName: string;
  displayPhoneNumber: string;
  wabaId: string;
  phoneNumberId: string;
  maskedPhoneNumberId: string | null;
  hasAccessToken: boolean;
  tokenExpiresAt: string | null;
  templateName: string;
  templateLanguage: string;
  webhookSubscribed: boolean;
  status: string;
  lastError: string;
  updatedAt: string | null;
} | null;

type EmbeddedSignupConfig = {
  enabled: boolean;
  appId: string;
  configId: string;
  graphVersion: string;
};

type EmbeddedSignupEventData = {
  wabaId?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  businessName?: string;
  phoneNumberName?: string;
};

async function fetchQueueItems(session: Session) {
  const res = await fetchWithSession(session, "/api/queue/list");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Sıra verileri alınamadı.");
  }

  return (json.items || []) as QueueItem[];
}

async function fetchWhatsAppStatus(session: Session) {
  const res = await fetchWithSession(session, "/api/whatsapp/status");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "WhatsApp durumu alınamadı.");
  }

  return json as WhatsAppStatus & { ok: true };
}

async function fetchIntegration(session: Session) {
  const res = await fetchWithSession(session, "/api/whatsapp/integration");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "WhatsApp bağlantısı alınamadı.");
  }

  return json.integration as IntegrationSummary;
}

async function fetchEmbeddedSignupConfig(session: Session) {
  const res = await fetchWithSession(session, "/api/whatsapp/embedded-signup/config");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Bağlantı ayarları alınamadı.");
  }

  return json as EmbeddedSignupConfig & { ok: true };
}

function getRequirementLabel(value: string) {
  switch (value) {
    case "Bağlantı kurulmadı":
      return "WhatsApp hesabı henüz bağlanmadı";
    case "Erişim anahtarı":
      return "Erişim anahtarı";
    case "Telefon numarası kimliği":
      return "Telefon numarası kimliği";
    case "Webhook bağlantısı":
      return "Webhook bağlantısı";
    default:
      return value;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function extractEmbeddedSignupMessage(raw: unknown): EmbeddedSignupEventData | null {
  let payload = raw;

  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const eventType = String(record.type || "");
  const eventName = String(record.event || "");
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const isExpectedType =
    eventType.toUpperCase().includes("WHATSAPP") ||
    eventType.toUpperCase().includes("EMBEDDED") ||
    eventName.toUpperCase().includes("FINISH") ||
    eventName.toUpperCase().includes("CANCEL") ||
    eventName.toUpperCase().includes("ERROR");

  if (!isExpectedType) {
    return null;
  }

  const wabaId =
    String(data.waba_id || data.wabaId || record.waba_id || record.wabaId || "").trim() ||
    undefined;
  const phoneNumberId =
    String(
      data.phone_number_id ||
        data.phoneNumberId ||
        record.phone_number_id ||
        record.phoneNumberId ||
        ""
    ).trim() || undefined;
  const displayPhoneNumber =
    String(
      data.display_phone_number ||
        data.displayPhoneNumber ||
        data.phone_number ||
        data.phoneNumber ||
        ""
    ).trim() || undefined;
  const businessName =
    String(data.business_name || data.businessName || record.business_name || "").trim() ||
    undefined;
  const phoneNumberName =
    String(data.phone_number_name || data.phoneNumberName || "").trim() || undefined;

  if (!wabaId && !phoneNumberId && !displayPhoneNumber && !businessName && !phoneNumberName) {
    return null;
  }

  return {
    wabaId,
    phoneNumberId,
    displayPhoneNumber,
    businessName,
    phoneNumberName,
  };
}

export default function AutomationPanel({ session }: Props) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [integration, setIntegration] = useState<IntegrationSummary>(null);
  const [embeddedConfig, setEmbeddedConfig] = useState<EmbeddedSignupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [pendingEvent, setPendingEvent] = useState<EmbeddedSignupEventData | null>(null);
  const waitingForEventRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setErrorText("");

        const [nextStatus, nextItems, nextIntegration, nextEmbeddedConfig] =
          await Promise.all([
            fetchWhatsAppStatus(session),
            fetchQueueItems(session),
            fetchIntegration(session),
            fetchEmbeddedSignupConfig(session),
          ]);

        if (!active) {
          return;
        }

        setStatus(nextStatus);
        setItems(nextItems);
        setIntegration(nextIntegration);
        setEmbeddedConfig(nextEmbeddedConfig);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorText(
          error instanceof Error ? error.message : "Otomasyon verileri alınamadı."
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://web.facebook.com",
        "https://business.facebook.com",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      const payload = extractEmbeddedSignupMessage(event.data);

      if (!payload) {
        return;
      }

      setPendingEvent(payload);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!pendingCode || !pendingEvent || connectLoading) {
      return;
    }

    let active = true;

    const completeSignup = async () => {
      try {
        setConnectLoading(true);
        setErrorText("");
        setSaveMessage("");

        const res = await fetchWithSession(
          session,
          "/api/whatsapp/embedded-signup/complete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: pendingCode,
              ...pendingEvent,
            }),
          }
        );

        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.error || "WhatsApp bağlantısı tamamlanamadı.");
        }

        if (!active) {
          return;
        }

        const [nextStatus, nextIntegration] = await Promise.all([
          fetchWhatsAppStatus(session),
          fetchIntegration(session),
        ]);

        if (!active) {
          return;
        }

        setStatus(nextStatus);
        setIntegration(nextIntegration);
        setSaveMessage("WhatsApp bağlantısı başarıyla tamamlandı.");
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorText(
          error instanceof Error ? error.message : "WhatsApp bağlantısı tamamlanamadı."
        );
      } finally {
        if (active) {
          setConnectLoading(false);
          setPendingCode(null);
          setPendingEvent(null);
          waitingForEventRef.current = false;
        }
      }
    };

    void completeSignup();

    return () => {
      active = false;
    };
  }, [connectLoading, pendingCode, pendingEvent, session]);

  const pendingCount = useMemo(() => {
    return items.filter((item) => item.status === "pending").length;
  }, [items]);

  const failedCount = useMemo(() => {
    return items.filter((item) => item.status === "failed").length;
  }, [items]);

  const missingRequirements = status?.missingRequirements || [];
  const hasMissingRequirements = missingRequirements.length > 0;
  const canStartEmbeddedSignup = Boolean(
    embeddedConfig?.enabled && embeddedConfig.appId && embeddedConfig.configId
  );

  const handleScriptReady = () => {
    if (!embeddedConfig?.appId) {
      return;
    }

    window.fbAsyncInit = () => {
      if (!window.FB) {
        return;
      }

      window.FB.init({
        appId: embeddedConfig.appId,
        cookie: true,
        xfbml: false,
        version: embeddedConfig.graphVersion || "v23.0",
      });

      setSdkReady(true);
    };

    if (window.FB) {
      window.fbAsyncInit();
    }
  };

  const handleConnectClick = () => {
    if (!window.FB || !embeddedConfig?.configId) {
      setErrorText("WhatsApp bağlantı ekranı şu anda açılamıyor.");
      return;
    }

    setErrorText("");
    setSaveMessage("");
    setPendingCode(null);
    setPendingEvent(null);
    waitingForEventRef.current = true;

    window.FB.login(
      (response) => {
        const code = response.authResponse?.code || "";

        if (!code) {
          waitingForEventRef.current = false;
          setErrorText("Bağlantı işlemi tamamlanmadı.");
          return;
        }

        setPendingCode(code);

        window.setTimeout(() => {
          if (waitingForEventRef.current && !pendingEvent) {
            setErrorText(
              "Bağlantı bilgileri tamamlanamadı. Lütfen pencereyi yeniden açıp tekrar deneyin."
            );
            setPendingCode(null);
            waitingForEventRef.current = false;
          }
        }, 8000);
      },
      {
        config_id: embeddedConfig.configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      {embeddedConfig?.enabled ? (
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
          onReady={handleScriptReady}
        />
      ) : null}

      {errorText && <div className="info-banner info-banner--error">{errorText}</div>}
      {saveMessage && !errorText ? <div className="info-banner">{saveMessage}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_380px]">
        <section className="surface-card surface-card--section rounded-[1.65rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="section-kicker">WhatsApp</p>
              <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                Gönderim durumu
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                Aktif hat durumunu ve mesaj sırasını tek ekranda takip et.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[29rem]">
              <div className="compact-stat">
                <p className="compact-stat__label">Durum</p>
                <p className="compact-stat__value">
                  {status?.configured ? "Hazır" : loading ? "Kontrol" : "Eksik"}
                </p>
              </div>

              <div className="compact-stat">
                <p className="compact-stat__label">Bekleyen sıra</p>
                <p className="compact-stat__value">{pendingCount}</p>
              </div>

              <div className="compact-stat">
                <p className="compact-stat__label">Başarısız</p>
                <p className="compact-stat__value">{failedCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="compact-stat">
              <p className="compact-stat__label">Gönderim biçimi</p>
              <p className="compact-stat__value">
                {status?.mode === "template" ? "Şablon" : "Serbest metin"}
              </p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Şablon</p>
              <p className="compact-stat__value">{status?.templateName || "Henüz eklenmedi"}</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Webhook</p>
              <p className="compact-stat__value">
                {status?.webhookConfigured ? "Hazır" : "Bekliyor"}
              </p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Hat kimliği</p>
              <p className="compact-stat__value">{status?.phoneNumberId || "-"}</p>
            </div>
          </div>

          <div className="surface-subcard surface-subcard--soft mt-5 rounded-[1.35rem] p-4">
            <p className="field-label mb-2">Durum notu</p>
            <p className="text-sm leading-6 text-[var(--text-2)]">
              {status?.recommendedMode || (loading ? "Yükleniyor..." : "-")}
            </p>
          </div>
        </section>

        <aside className="surface-card surface-card--rail rounded-[1.65rem] p-4">
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="section-kicker">Bağlantı</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                WhatsApp hesabını bağla
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                Meta hesabınla güvenli şekilde bağlantı kur. Numaran ve işletme
                bilgilerin bağlandıktan sonra gönderim için hazır hale gelir.
              </p>
            </div>

            {integration ? (
              <div className="surface-subcard surface-subcard--soft rounded-[1.2rem] p-4">
                <p className="field-label mb-2">Bağlı hesap</p>
                <div className="space-y-2 text-sm text-[var(--text-1)]">
                  <p>
                    İşletme:{" "}
                    <strong className="text-[var(--text-0)]">
                      {integration.businessName || "WhatsApp hesabı"}
                    </strong>
                  </p>
                  <p>
                    Numara:{" "}
                    <strong className="text-[var(--text-0)]">
                      {integration.displayPhoneNumber || "-"}
                    </strong>
                  </p>
                  <p>
                    Şablon:{" "}
                    <strong className="text-[var(--text-0)]">
                      {integration.templateName || "Henüz eklenmedi"}
                    </strong>
                  </p>
                  <p>
                    Son güncelleme:{" "}
                    <strong className="text-[var(--text-0)]">
                      {formatDate(integration.updatedAt)}
                    </strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="surface-subcard surface-subcard--soft rounded-[1.2rem] p-4">
                <p className="field-label mb-2">Hazırlık</p>
                <p className="text-sm leading-6 text-[var(--text-2)]">
                  İlk bağlantıdan sonra işletme hattın otomatik olarak hesabına eklenir.
                </p>
              </div>
            )}

            <button
              onClick={handleConnectClick}
              disabled={!canStartEmbeddedSignup || !sdkReady || connectLoading}
              className="primary-btn w-full justify-center"
            >
              {connectLoading
                ? "Bağlantı tamamlanıyor..."
                : integration
                  ? "Bağlantıyı Yenile"
                  : "WhatsApp Bağla"}
            </button>

            {!canStartEmbeddedSignup ? (
              <div className="surface-subcard surface-subcard--soft rounded-[1.2rem] p-4">
                <p className="field-label mb-2">Bilgi</p>
                <p className="text-sm leading-6 text-[var(--text-2)]">
                  Bu hesap için bağlantı ekranı yakında aktif olacaktır. Destek
                  ekibiyle iletişime geçerek kurulum planı oluşturabilirsin.
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {!loading && hasMissingRequirements ? (
        <div className="surface-card surface-card--quiet rounded-[1.65rem] p-5 text-sm text-[var(--text-1)]">
          Gönderime başlamadan önce şu başlıkların tamamlanması gerekir:{" "}
          {missingRequirements.map(getRequirementLabel).join(", ")}.
        </div>
      ) : null}

      {loading ? (
        <div className="surface-card surface-card--quiet rounded-[1.65rem] p-5 text-[var(--text-1)]">
          Otomasyon verileri yükleniyor...
        </div>
      ) : (
        <QueueTable items={items} />
      )}
    </div>
  );
}
