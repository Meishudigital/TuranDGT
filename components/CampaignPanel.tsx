"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchWithSession } from "@/lib/auth-client";
import {
  clearCampaignComposerState,
  clearCampaignDraft,
  readCampaignComposerState,
  readCampaignDraft,
  writeCampaignComposerState,
  type CampaignDraft,
} from "@/lib/campaign-draft";

type CampaignSummary = {
  id: number;
  user_id: string;
  name: string;
  message_template: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  total_count: number;
  pending_count: number;
  sent_count: number;
  failed_count: number;
};

type Props = {
  session: Session;
};

type StartConfirmationTarget = {
  id: number;
  name: string;
  pendingCount: number;
  scopeLabel: string;
};

function truncateText(value: string, maxLength = 150) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function buildScopeLabel(campaign: CampaignSummary) {
  return [campaign.city, campaign.district, campaign.neighborhood]
    .filter(Boolean)
    .join(" / ") || "Tüm yetkili iller";
}

async function fetchCampaigns(session: Session) {
  const res = await fetchWithSession(session, "/api/campaigns/list");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Kampanyalar alınamadı.");
  }

  return (json.items || []) as CampaignSummary[];
}

export default function CampaignPanel({ session }: Props) {
  const router = useRouter();
  const userId = session.user.id;
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [sendingTestMessage, setSendingTestMessage] = useState(false);
  const [liveSendUnlocked, setLiveSendUnlocked] = useState(false);
  const [confirmationTarget, setConfirmationTarget] =
    useState<StartConfirmationTarget | null>(null);
  const [startingCampaignId, setStartingCampaignId] = useState<number | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<number | null>(null);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  useEffect(() => {
    setDraft(readCampaignDraft(userId));

    const composerState = readCampaignComposerState(userId);

    if (composerState) {
      setCampaignName(composerState.campaignName);
      setMessageTemplate(composerState.messageTemplate);
      setTestPhoneNumber(composerState.testPhoneNumber);
    }
  }, [userId]);

  useEffect(() => {
    writeCampaignComposerState(userId, {
      campaignName,
      messageTemplate,
      testPhoneNumber,
    });
  }, [campaignName, messageTemplate, testPhoneNumber, userId]);

  useEffect(() => {
    let active = true;

    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true);
        const nextCampaigns = await fetchCampaigns(session);

        if (!active) {
          return;
        }

        setCampaigns(nextCampaigns);
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorText(error instanceof Error ? error.message : "Kampanyalar alınamadı.");
      } finally {
        if (active) {
          setLoadingCampaigns(false);
        }
      }
    };

    void loadCampaigns();

    return () => {
      active = false;
    };
  }, [session]);

  const totalQueuedCount = useMemo(() => {
    return campaigns.reduce((total, item) => total + item.total_count, 0);
  }, [campaigns]);

  const stagedCount = draft?.items.length || 0;
  const stagedScope = draft?.sourceScope || "Seçim bekliyor";

  const handleClearDraft = () => {
    clearCampaignDraft(userId);
    setDraft(null);
    setSuccessText("");
    setErrorText("");
  };

  const handleCreateCampaign = async () => {
    if (!draft || draft.items.length === 0) {
      setErrorText("Kampanya oluşturmak için önce İlan Bul ekranından ilan seçmelisin.");
      return;
    }

    if (!campaignName.trim()) {
      setErrorText("Kampanya adı zorunludur.");
      return;
    }

    if (!messageTemplate.trim()) {
      setErrorText("Mesaj metni zorunludur.");
      return;
    }

    try {
      setCreatingCampaign(true);
      setErrorText("");
      setSuccessText("");

      const res = await fetchWithSession(session, "/api/campaigns/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignName,
          messageTemplate,
          city: draft.city,
          district: draft.district,
          neighborhood: draft.neighborhood,
          selectedListings: draft.items.map((item) => ({
            id: item.id,
            owner_name: item.owner_name,
            phone_number: item.phone_number,
            phone_e164: item.phone_e164,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorText(json.error || "Kampanya oluşturulamadı.");
        return;
      }

      clearCampaignDraft(userId);
      clearCampaignComposerState(userId);
      setDraft(null);
      setCampaignName("");
      setMessageTemplate("");
      setTestPhoneNumber("");
      setCampaigns(await fetchCampaigns(session));
      setSuccessText(`${json.queuedCount} kayıtla kampanya oluşturuldu.`);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Kampanya oluşturulamadı."
      );
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhoneNumber.trim()) {
      setErrorText("Test gönderimi için önce bir telefon numarası gir.");
      return;
    }

    if (!messageTemplate.trim()) {
      setErrorText("Test gönderimi için mesaj metni zorunludur.");
      return;
    }

    try {
      setSendingTestMessage(true);
      setErrorText("");
      setSuccessText("");

      const res = await fetchWithSession(session, "/api/whatsapp/test-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          messageText: messageTemplate,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorText(json.error || "Test mesajı gönderilemedi.");
        return;
      }

      setTestPhoneNumber(json.phoneNumber || testPhoneNumber);
      setSuccessText(
        `${json.phoneNumber} numarasına test mesajı ${json.mode === "template" ? "şablon" : "serbest metin"} modunda gönderildi.`
      );
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Test mesajı gönderilemedi."
      );
    } finally {
      setSendingTestMessage(false);
    }
  };

  const handleOpenStartConfirmation = (campaign: CampaignSummary) => {
    if (!liveSendUnlocked) {
      setErrorText(
        "Canlı toplu gönderim kilidi kapalı. Önce güvenlik kilidini aç."
      );
      return;
    }

    if (campaign.pending_count === 0) {
      setErrorText("Bu kampanyada gönderilecek bekleyen kayıt yok.");
      return;
    }

    setErrorText("");
    setSuccessText("");
    setConfirmationTarget({
      id: campaign.id,
      name: campaign.name,
      pendingCount: campaign.pending_count,
      scopeLabel: buildScopeLabel(campaign),
    });
  };

  const handleCloseStartConfirmation = () => {
    if (startingCampaignId !== null) {
      return;
    }

    setConfirmationTarget(null);
  };

  const handleStartCampaign = async (campaignId: number) => {
    try {
      setStartingCampaignId(campaignId);
      setErrorText("");
      setSuccessText("");

      let remainingCount = 0;
      let totalProcessed = 0;
      let loopCount = 0;

      do {
        const res = await fetchWithSession(session, `/api/campaigns/${campaignId}/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmLiveSend: true,
          }),
        });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setErrorText(json.error || "Kampanya başlatılamadı.");
          return;
        }

        remainingCount = Number(json.remainingCount || 0);
        totalProcessed += Number(json.processedCount || 0);
        loopCount += 1;

        if (remainingCount > 0) {
          setSuccessText(
            `Kampanya gönderimi sürüyor. ${totalProcessed} kayıt işlendi, ${remainingCount} kayıt bekliyor.`
          );
          await new Promise((resolve) => window.setTimeout(resolve, 500));
        } else {
          setSuccessText(
            `Kampanya başlatıldı. Toplam ${totalProcessed} kayıt WhatsApp sırasına gönderildi.`
          );
        }
      } while (remainingCount > 0 && loopCount < 60);

      setCampaigns(await fetchCampaigns(session));
      setConfirmationTarget(null);
      setLiveSendUnlocked(false);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Kampanya başlatılamadı.");
    } finally {
      setStartingCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    try {
      setDeletingCampaignId(campaignId);
      setErrorText("");
      setSuccessText("");

      const res = await fetchWithSession(session, `/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setErrorText(json.error || "Kampanya silinemedi.");
        return;
      }

      setCampaigns((prev) => prev.filter((item) => item.id !== campaignId));
      setSuccessText(`Kampanya #${campaignId} silindi.`);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Kampanya silinemedi.");
    } finally {
      setDeletingCampaignId(null);
    }
  };

  return (
    <div className="space-y-5">
      {errorText && <div className="info-banner info-banner--error">{errorText}</div>}
      {successText && <div className="info-banner info-banner--success">{successText}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="surface-card surface-card--section rounded-[1.65rem] p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="section-kicker">Kampanya</p>
                <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                  Taslaktan gönderime geç
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                  Seçimi kampanyaya çevir, testi gönder, sonra canlıya al.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[29rem]">
                <div className="compact-stat">
                  <p className="compact-stat__label">Taslak</p>
                  <p className="compact-stat__value">{stagedCount}</p>
                </div>

                <div className="compact-stat">
                  <p className="compact-stat__label">Kampanya</p>
                  <p className="compact-stat__value">{campaigns.length}</p>
                </div>

                <div className="compact-stat">
                    <p className="compact-stat__label">Sıra</p>
                  <p className="compact-stat__value">{totalQueuedCount}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="surface-subcard surface-subcard--inset rounded-[1.35rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="field-label mb-1">Hazır seçim</p>
                    <p className="text-sm text-[var(--text-3)]">
                      {stagedScope}
                    </p>
                  </div>

                  {draft?.items.length ? (
                    <button onClick={handleClearDraft} className="ghost-btn text-sm">
                      Seçimi temizle
                    </button>
                  ) : null}
                </div>

                {draft?.items.length ? (
                  <div className="mt-4 space-y-3">
                    {draft.items.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1rem] border border-white/8 bg-black/20 px-3.5 py-3"
                      >
                        <p className="table-cell--strong text-sm font-semibold leading-6">
                          {item.title || "Başlık bulunamadı"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-2)]">
                          {item.owner_name || "-"} - {[item.city, item.district].filter(Boolean).join(" / ") || "-"}
                        </p>
                      </div>
                    ))}

                    {draft.items.length > 6 && (
                      <div className="rounded-[1rem] border border-dashed border-white/10 px-3.5 py-3 text-sm text-[var(--text-2)]">
                        +{draft.items.length - 6} kayıt daha
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state mt-4 rounded-[1rem] border border-dashed border-white/10 bg-black/20">
                    Hazır seçim yok.
                  </div>
                )}
              </div>

              <div className="surface-subcard surface-subcard--soft rounded-[1.35rem] p-4">
                <div className="space-y-4">
                  <div>
                    <label className="field-label">Kampanya adı</label>
                    <input
                      value={campaignName}
                      onChange={(event) => setCampaignName(event.target.value)}
                      placeholder="Örnek: Kuşadası ilk temas"
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="field-label">Mesaj metni</label>
                    <textarea
                      value={messageTemplate}
                      onChange={(event) => setMessageTemplate(event.target.value)}
                      placeholder="Gönderilecek mesaj"
                      rows={7}
                      className="field-input min-h-[10rem] resize-none"
                    />
                  </div>

                  <div className="surface-subcard surface-subcard--inset rounded-[1.1rem] p-3.5">
                    <p className="field-label mb-3">Test gönderimi</p>

                    <div className="space-y-3">
                      <div>
                        <label className="field-label">Test numarası</label>
                        <input
                          value={testPhoneNumber}
                          onChange={(event) => setTestPhoneNumber(event.target.value)}
                          placeholder="+905xxxxxxxxx"
                          className="field-input"
                        />
                        <p className="mt-2 text-xs leading-5 text-[var(--text-3)]">
                          Sadece kendi test numaran için kullan.
                        </p>
                      </div>

                      <button
                        onClick={() => void handleSendTestMessage()}
                        disabled={sendingTestMessage || !messageTemplate.trim()}
                        className="secondary-btn w-full justify-center"
                      >
                        {sendingTestMessage
                          ? "Test mesajı gönderiliyor..."
                          : "Bu numaraya test mesajı gönder"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => void handleCreateCampaign()}
                    disabled={creatingCampaign || stagedCount === 0}
                    className="primary-btn w-full"
                  >
                    {creatingCampaign ? "Kampanya oluşuyor..." : "Kampanyayı oluştur"}
                  </button>

                  <button onClick={() => router.push("/workspace")} className="ghost-btn w-full">
                    İlan bul ekranına dön
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-card surface-card--rail rounded-[1.65rem] p-4">
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="section-kicker">Kontrol</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                Gönderim akışı
              </h2>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">1</p>
              <p className="compact-stat__value">Seçimi hazırla</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">2</p>
              <p className="compact-stat__value">Test gönder</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">3</p>
              <p className="compact-stat__value">Canlıya al</p>
            </div>

            <div className="surface-subcard surface-subcard--soft rounded-[1.2rem] p-4">
              <p className="field-label mb-3">Canlı gönderim kilidi</p>
              <label className="flex items-start gap-3 text-sm leading-6 text-[var(--text-1)]">
                <input
                  type="checkbox"
                  checked={liveSendUnlocked}
                  onChange={(event) => setLiveSendUnlocked(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/15 bg-black/30 text-[var(--accent)]"
                />
                <span>
                  Kilit açılmadan toplu gönderim başlamaz.
                </span>
              </label>
            </div>

            <Link href="/workspace/automation" className="secondary-btn w-full justify-center">
              Otomatik mesaj ekranını aç
            </Link>
          </div>
        </aside>
      </div>

      <section className="table-shell">
        <div className="table-top">
          <div className="max-w-2xl">
            <p className="section-kicker">Kampanyalar</p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Hesabına ait liste
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
              Başlat, izle veya sil.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="metric-chip">
              Kampanya <strong className="text-[var(--text-0)]">{campaigns.length}</strong>
            </span>
            <span className="metric-chip">
              Sıra <strong className="text-[var(--text-0)]">{totalQueuedCount}</strong>
            </span>
          </div>
        </div>

        <div className="thin-scroll overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/20 text-left">
              <tr>
              <th className="table-head-cell min-w-[120px]">Kampanya</th>
              <th className="table-head-cell min-w-[220px]">Kapsam</th>
              <th className="table-head-cell min-w-[320px]">Mesaj</th>
              <th className="table-head-cell min-w-[220px]">Durum</th>
              <th className="table-head-cell min-w-[190px]">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="table-row">
                  <td className="table-cell">
                      <div className="space-y-1.5">
                        <p className="table-cell--strong">{campaign.name}</p>
                        <p className="table-cell--muted text-sm">#{campaign.id}</p>
                      </div>
                    </td>

                  <td className="table-cell">
                    <p className="table-cell--strong">{buildScopeLabel(campaign)}</p>
                  </td>

                  <td className="table-cell">
                    <p className="leading-6 text-[var(--text-1)]" title={campaign.message_template}>
                      {truncateText(campaign.message_template)}
                    </p>
                  </td>

                  <td className="table-cell">
                    <div className="flex flex-wrap gap-2">
                      <span className="table-meta-pill">Toplam {campaign.total_count}</span>
                      <span className="status-pill status-pill--pending">
                        Bekleyen {campaign.pending_count}
                      </span>
                      <span className="status-pill status-pill--sent">
                        Giden {campaign.sent_count}
                      </span>
                      <span className="status-pill status-pill--failed">
                        Hata {campaign.failed_count}
                      </span>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenStartConfirmation(campaign)}
                        disabled={
                          startingCampaignId === campaign.id ||
                          campaign.pending_count === 0 ||
                          !liveSendUnlocked
                        }
                        className="secondary-btn px-3.5 py-2 text-sm"
                      >
                        {startingCampaignId === campaign.id
                          ? "Başlatılıyor..."
                          : campaign.pending_count > 0
                            ? liveSendUnlocked
                              ? "Başlat"
                              : "Kilit kapalı"
                            : "Tamamlandı"}
                      </button>

                      <button
                        onClick={() => void handleDeleteCampaign(campaign.id)}
                        disabled={deletingCampaignId === campaign.id}
                        className="ghost-btn px-3.5 py-2 text-sm"
                      >
                        {deletingCampaignId === campaign.id ? "Siliniyor..." : "Sil"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loadingCampaigns && campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Henüz bu hesaba ait kampanya yok.
                  </td>
                </tr>
              )}

              {loadingCampaigns && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Kampanya listesi yükleniyor...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {confirmationTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="surface-card surface-card--section w-full max-w-xl rounded-[1.6rem] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <p className="section-kicker">Canlı gönderim onayı</p>
            <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Bu kampanya gerçek numaralara mesaj gönderecek
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-1)]">
              Devam edersen bekleyen kayıtlar WhatsApp üzerinden ilan sahiplerine
              gönderilmeye başlayacak.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="compact-stat">
                <p className="compact-stat__label">Kampanya</p>
                <p className="compact-stat__value">{confirmationTarget.name}</p>
              </div>
              <div className="compact-stat">
                <p className="compact-stat__label">Bekleyen</p>
                <p className="compact-stat__value">{confirmationTarget.pendingCount}</p>
              </div>
              <div className="compact-stat">
                <p className="compact-stat__label">Kapsam</p>
                <p className="compact-stat__value">{confirmationTarget.scopeLabel}</p>
              </div>
            </div>

            <div className="surface-subcard surface-subcard--soft mt-4 rounded-[1.2rem] p-4">
              <p className="field-label mb-2">Son kontrol</p>
              <p className="text-sm leading-7 text-[var(--text-1)]">
                Eğer yalnızca deneme yapmak istiyorsan bu pencereyi kapat ve test
                gönderimi alanını kullan. Bu buton toplu canlı gönderim içindir.
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={handleCloseStartConfirmation} className="ghost-btn sm:min-w-[140px]">
                Vazgeç
              </button>
              <button
                onClick={() => void handleStartCampaign(confirmationTarget.id)}
                disabled={startingCampaignId === confirmationTarget.id}
                className="primary-btn sm:min-w-[210px]"
              >
                {startingCampaignId === confirmationTarget.id
                  ? "Gönderim başlatılıyor..."
                  : "Evet, canlı gönderimi başlat"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
