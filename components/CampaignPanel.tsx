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

function truncateText(value: string, maxLength = 150) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function buildScopeLabel(campaign: CampaignSummary) {
  return [campaign.city, campaign.district, campaign.neighborhood]
    .filter(Boolean)
    .join(" / ") || "Tum yetkili iller";
}

async function fetchCampaigns(session: Session) {
  const res = await fetchWithSession(session, "/api/campaigns/list");
  const json = await res.json();

  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Kampanyalar alinamadi.");
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

        setErrorText(error instanceof Error ? error.message : "Kampanyalar alinamadi.");
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
  const stagedScope = draft?.sourceScope || "Secim bekliyor";

  const handleClearDraft = () => {
    clearCampaignDraft(userId);
    setDraft(null);
    setSuccessText("");
    setErrorText("");
  };

  const handleCreateCampaign = async () => {
    if (!draft || draft.items.length === 0) {
      setErrorText("Kampanya olusturmak icin once Ilan Bulma ekranindan ilan secmelisin.");
      return;
    }

    if (!campaignName.trim()) {
      setErrorText("Kampanya adi zorunludur.");
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
        setErrorText(json.error || "Kampanya olusturulamadi.");
        return;
      }

      clearCampaignDraft(userId);
      clearCampaignComposerState(userId);
      setDraft(null);
      setCampaignName("");
      setMessageTemplate("");
      setCampaigns(await fetchCampaigns(session));
      setSuccessText(`${json.queuedCount} ilan icin kampanya olusturuldu.`);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Kampanya olusturulamadi."
      );
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhoneNumber.trim()) {
      setErrorText("Test gonderimi icin once bir telefon numarasi gir.");
      return;
    }

    if (!messageTemplate.trim()) {
      setErrorText("Test gonderimi icin mesaj metni zorunludur.");
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
        setErrorText(json.error || "Test mesaji gonderilemedi.");
        return;
      }

      setTestPhoneNumber(json.phoneNumber || testPhoneNumber);
      setSuccessText(
        `${json.phoneNumber} numarasina test mesaji ${json.mode === "template" ? "template" : "text"} modunda gonderildi.`
      );
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Test mesaji gonderilemedi."
      );
    } finally {
      setSendingTestMessage(false);
    }
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
        });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setErrorText(json.error || "Kampanya baslatilamadi.");
          return;
        }

        remainingCount = Number(json.remainingCount || 0);
        totalProcessed += Number(json.processedCount || 0);
        loopCount += 1;

        if (remainingCount > 0) {
          setSuccessText(
            `Kampanya gonderimi suruyor. ${totalProcessed} kayit islendi, ${remainingCount} kayit bekliyor.`
          );
          await new Promise((resolve) => window.setTimeout(resolve, 500));
        } else {
          setSuccessText(
            `Kampanya baslatildi. Toplam ${totalProcessed} kayit WhatsApp sirasina gonderildi.`
          );
        }
      } while (remainingCount > 0 && loopCount < 60);

      setCampaigns(await fetchCampaigns(session));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Kampanya baslatilamadi.");
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
        <section className="surface-card rounded-[1.65rem] p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="section-kicker">Kampanya Calisma Alani</p>
                <h2 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                  Secimden kampanyaya gecis
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--text-1)]">
                  Ilan Bulma ekranindan gelen secimleri burada kampanyaya donustur.
                  Olusan kampanyalar yalnizca bu hesaba ozel gorunur, baslatilir ve silinebilir.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[29rem]">
                <div className="compact-stat">
                  <p className="compact-stat__label">Hazir secim</p>
                  <p className="compact-stat__value">{stagedCount}</p>
                </div>

                <div className="compact-stat">
                  <p className="compact-stat__label">Toplam kampanya</p>
                  <p className="compact-stat__value">{campaigns.length}</p>
                </div>

                <div className="compact-stat">
                  <p className="compact-stat__label">Queue kaydi</p>
                  <p className="compact-stat__value">{totalQueuedCount}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="surface-subcard rounded-[1.35rem] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="field-label mb-1">Hazir secim</p>
                    <p className="text-sm text-[var(--text-2)]">
                      Aktif kapsam: {stagedScope}
                    </p>
                  </div>

                  {draft?.items.length ? (
                    <button onClick={handleClearDraft} className="ghost-btn text-sm">
                      Secimi Temizle
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
                          {item.title || "Baslik bulunamadi"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-2)]">
                          {item.owner_name || "-"} - {[item.city, item.district].filter(Boolean).join(" / ") || "-"}
                        </p>
                      </div>
                    ))}

                    {draft.items.length > 6 && (
                      <div className="rounded-[1rem] border border-dashed border-white/10 px-3.5 py-3 text-sm text-[var(--text-2)]">
                        +{draft.items.length - 6} ilan daha kampanya taslaginda tutuluyor.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state mt-4 rounded-[1rem] border border-dashed border-white/10 bg-black/20">
                    Kampanya taslagi bos. Once ilan secmek icin ilan bulma ekranina gec.
                  </div>
                )}
              </div>

              <div className="surface-subcard rounded-[1.35rem] p-4">
                <div className="space-y-4">
                  <div>
                    <label className="field-label">Kampanya adi</label>
                    <input
                      value={campaignName}
                      onChange={(event) => setCampaignName(event.target.value)}
                      placeholder="Ornek: Kusadasi ilk temas"
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label className="field-label">Mesaj metni</label>
                    <textarea
                      value={messageTemplate}
                      onChange={(event) => setMessageTemplate(event.target.value)}
                      placeholder="Merhaba, ilandaki gayrimenkulunuz icin size ulasmak istedim..."
                      rows={8}
                      className="field-input min-h-[12rem] resize-none"
                    />
                  </div>

                  <div className="surface-subcard rounded-[1.1rem] p-3.5">
                    <p className="field-label mb-3">Hizli test gonderimi</p>

                    <div className="space-y-3">
                      <div>
                        <label className="field-label">Test numarasi</label>
                        <input
                          value={testPhoneNumber}
                          onChange={(event) => setTestPhoneNumber(event.target.value)}
                          placeholder="+905xxxxxxxxx"
                          className="field-input"
                        />
                        <p className="mt-2 text-xs leading-6 text-[var(--text-2)]">
                          Bu alan sadece kendi test numarana manuel deneme yapmak icin.
                          En guvenlisi numarayi +90 formatinda yazman.
                        </p>
                      </div>

                      <button
                        onClick={() => void handleSendTestMessage()}
                        disabled={sendingTestMessage || !messageTemplate.trim()}
                        className="secondary-btn w-full justify-center"
                      >
                        {sendingTestMessage
                          ? "Test Mesaji Gonderiliyor..."
                          : "Bu Numaraya Test Mesaji Gonder"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => void handleCreateCampaign()}
                    disabled={creatingCampaign || stagedCount === 0}
                    className="primary-btn w-full"
                  >
                    {creatingCampaign ? "Kampanya Olusuyor..." : "Kampanyayi Olustur"}
                  </button>

                  <button onClick={() => router.push("/")} className="ghost-btn w-full">
                    Ilan Bulma Ekranina Don
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-card rounded-[1.65rem] p-4">
          <div className="flex h-full flex-col gap-4">
            <div>
              <p className="section-kicker">Kisa Notlar</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                Otomasyon mantigi
              </h2>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">1. Adim</p>
              <p className="compact-stat__value">Ilan Bulma ekraninda ilan sec.</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">2. Adim</p>
              <p className="compact-stat__value">Kampanyayi olustur ve queue satirlarini hazirla.</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">3. Adim</p>
              <p className="compact-stat__value">Baslat butonu ile WhatsApp batch gonderimini calistir.</p>
            </div>

            <Link href="/automation" className="secondary-btn w-full justify-center">
              Otomatik Mesaj Ekranini Ac
            </Link>
          </div>
        </aside>
      </div>

      <section className="table-shell">
        <div className="table-top">
          <div className="max-w-3xl">
            <p className="section-kicker">Hesabina Ozel Kampanyalar</p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Olusturulan kampanya listesi
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-1)]">
              Bu tablo yalnizca oturumdaki kullanicinin kampanyalarini gosterir.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="metric-chip">
              Kampanya: <strong className="text-[var(--text-0)]">{campaigns.length}</strong>
            </span>
            <span className="metric-chip">
              Queue: <strong className="text-[var(--text-0)]">{totalQueuedCount}</strong>
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
                <th className="table-head-cell min-w-[190px]">Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="table-row">
                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <p className="table-cell--strong">{campaign.name}</p>
                      <p className="table-cell--muted text-sm">Kampanya #{campaign.id}</p>
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
                        Bekliyor {campaign.pending_count}
                      </span>
                      <span className="status-pill status-pill--sent">
                        Gonderildi {campaign.sent_count}
                      </span>
                      <span className="status-pill status-pill--failed">
                        Hata {campaign.failed_count}
                      </span>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => void handleStartCampaign(campaign.id)}
                        disabled={startingCampaignId === campaign.id || campaign.pending_count === 0}
                        className="secondary-btn px-3.5 py-2 text-sm"
                      >
                        {startingCampaignId === campaign.id
                          ? "Baslatiliyor..."
                          : campaign.pending_count > 0
                            ? "Baslat"
                            : "Tamamlandi"}
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
                    Henuz bu hesaba ait kampanya yok.
                  </td>
                </tr>
              )}

              {loadingCampaigns && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Kampanya listesi yukleniyor...
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
