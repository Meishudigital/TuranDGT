"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

const featureItems = [
  "Musteri bazli yetkilendirme",
  "Bolgeye ozel ilan akisi",
  "Kontrollu kampanya kuyrugu",
];

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, profile, regions, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (isLoading || !session) {
      return;
    }

    if (profile?.onboarding_completed && regions.length > 0) {
      router.replace("/");
      return;
    }

    router.replace("/onboarding");
  }, [isLoading, profile?.onboarding_completed, regions.length, router, session]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorText("E-posta zorunludur.");
      return;
    }

    if (!password) {
      setErrorText("Sifre zorunludur.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorText("");

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorText(error.message);
        return;
      }

      router.replace("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[100rem] items-stretch gap-5 xl:grid-cols-[minmax(0,1.08fr)_430px]">
        <section className="surface-card page-rise rounded-[1.9rem] p-6 md:p-8">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="brand-badge">TD</span>
                <div>
                  <p className="toolbar-title">Turan Digital</p>
                  <p className="toolbar-subtitle">Musteri operasyon paneli</p>
                </div>
              </div>

              <p className="section-kicker mt-8">Secure Workspace</p>
              <h1 className="section-title mt-4">
                Emlak operasyonunu tek bir temiz SaaS ekraninda yonetin.
              </h1>
              <p className="section-copy mt-4 max-w-2xl text-base">
                Musterilerin yalnizca kendi bolgelerini gormesini saglayan, filtre,
                queue ve profil akislarini ayni calisma duzeninde birlestiren ozel panel.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {featureItems.map((item, index) => (
                <div
                  key={item}
                  className={`compact-stat page-rise page-rise-${Math.min(
                    index + 2,
                    4
                  )}`}
                >
                  <p className="compact-stat__label">0{index + 1}</p>
                  <p className="compact-stat__value mt-1 text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card page-rise page-rise-2 rounded-[1.9rem] p-6 md:p-7">
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="section-kicker">Musteri Girisi</p>
              <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                Hesabina guvenli sekilde baglan
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-1)]">
                Size tanimlanan e-posta ve sifre ile giris yapin.
              </p>
            </div>

            {errorText && (
              <div className="info-banner info-banner--error">{errorText}</div>
            )}

            <div className="space-y-5">
              <div>
                <label className="field-label">E-posta</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@firma.com"
                  type="email"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Sifre</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Sifrenizi girin"
                  className="field-input"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="primary-btn w-full"
              >
                {submitting ? "Giris yapiliyor..." : "Giris Yap"}
              </button>

              <p className="text-sm text-[var(--text-2)]">
                Ilk giris sonrasinda isim, soy isim ve yetkili il secimi zorunludur.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
