"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

const featureItems = [
  "Bölgeye göre filtrelenen ilan akışı",
  "Tek yerde hazırlanan kampanya düzeni",
  "Daha güven veren müşteri deneyimi",
];

const panelHighlights = [
  { label: "Yetkili bölge", value: "İzmir / Bornova" },
  { label: "Hazır görüşme", value: "12 kayıt" },
  { label: "İlerleme hissi", value: "Sakin düzen" },
];

const workflowItems = [
  "İlan Bulma",
  "Kampanya Oluştur",
  "Otomatik Mesaj",
  "Yeni İlanlar",
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
      router.replace("/workspace");
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
      setErrorText("Şifre zorunludur.");
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

      router.replace("/workspace");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.09),transparent_24%),linear-gradient(180deg,#090b0f_0%,#111419_42%,#0c0f13_100%)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[100rem] items-stretch gap-5 xl:grid-cols-[minmax(0,1.08fr)_430px]">
        <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,rgba(22,25,31,0.96),rgba(12,15,19,0.98))] px-6 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] md:px-8 md:py-8">
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4">
                <div className="relative flex h-[82px] w-[58px] items-center justify-center overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,#0b0d11,#20262f)] shadow-[0_14px_28px_rgba(0,0,0,0.28)]">
                  <Image
                    src="/logo.png"
                    alt="Turan DGT logosu"
                    fill
                    sizes="58px"
                    priority
                    className="object-contain p-2"
                  />
                </div>

                <div>
                  <p className="text-lg font-semibold tracking-[-0.03em] text-white">
                    Turan DGT
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Emlak ekipleri için düzenli çalışma alanı
                  </p>
                </div>
              </div>

              <p className="mt-10 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-white/45">
                Hoş geldiniz
              </p>
              <h1 className="mt-4 max-w-[780px] text-[clamp(2.7rem,2.1rem+2.2vw,4.9rem)] font-semibold leading-[0.94] tracking-[-0.07em] text-white">
                Müşteriyle kurduğunuz iletişimi daha sakin,
                <br />
                daha güven veren bir düzene taşıyın.
              </h1>
              <p className="mt-6 max-w-[720px] text-[1.02rem] leading-8 text-white/68">
                Turan DGT; ilan seçimi, kampanya hazırlığı ve iletişim sürecini
                aynı çalışma akışında birleştirir. Dışarıda güven veren bir vitrin,
                içeride ise ekiplerin rahatça kullanabildiği net bir panel sunar.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_270px]">
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#151920,#0d1015)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-5">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/16" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/62">
                    Müşteri memnuniyeti odaklı
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
                  <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.035] p-3">
                    <div className="flex items-center gap-3 rounded-[1rem] bg-white/[0.06] px-3 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-[0.85rem] border border-white/10 bg-black/30">
                        <Image
                          src="/logo.png"
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Turan DGT</p>
                        <p className="text-xs text-white/50">Özel panel görünümü</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {workflowItems.map((item, index) => (
                        <div
                          key={item}
                          className={`rounded-[0.95rem] px-3 py-3 text-sm ${
                            index === 0
                              ? "border border-white/10 bg-white/[0.09] font-semibold text-white"
                              : "text-white/58"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {panelHighlights.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-4"
                        >
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/42">
                            {item.label}
                          </p>
                          <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-[#10141a] px-4 py-4 md:px-5">
                      <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                        <div>
                          <p className="text-base font-semibold text-white">
                            Bugün ilgilenilen ilanlar
                          </p>
                          <p className="text-sm text-white/48">
                            Seçime uygun görünüm
                          </p>
                        </div>
                        <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/60">
                          Hazır
                        </span>
                      </div>

                      <div className="mt-3 space-y-3">
                        {[
                          ["3+1 satılık daire", "Bornova / Yeni kayıt", "TL 6.450.000"],
                          ["Köşe başı dükkan", "Karşıyaka / Portföyde", "TL 8.900.000"],
                          ["Yatırımlık ofis", "Bayraklı / Görüşme hazır", "TL 4.980.000"],
                        ].map(([title, note, price]) => (
                          <div
                            key={title}
                            className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/6 bg-white/[0.03] px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">{title}</p>
                              <p className="mt-1 text-xs text-white/44">{note}</p>
                            </div>
                            <p className="text-sm font-semibold text-white/86">{price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-5 right-5 w-[270px] rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(242,244,247,0.92))] p-4 shadow-[0_22px_50px_rgba(0,0,0,0.24)]">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#778191]">
                    Müşteri notu
                  </p>
                  <p className="mt-2 text-base font-semibold leading-6 text-[#16191f]">
                    Görüşmeleri daha düzenli takip etmek artık çok daha kolay.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5f6976]">
                    Tek ekranda toplanan süreç, ekibin aynı düzenle ilerlemesini
                    ve müşteriye daha güven veren bir deneyim sunmasını sağlıyor.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {featureItems.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-[1.35rem] border border-white/8 bg-white/[0.035] px-5 py-5 shadow-[0_18px_34px_rgba(0,0,0,0.12)] page-rise page-rise-${Math.min(
                      index + 2,
                      4
                    )}`}
                  >
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                      0{index + 1}
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-7 tracking-[-0.03em] text-white">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(23,26,31,0.98),rgba(14,17,22,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)] md:p-7">
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-white/42">
                Müşteri girişi
              </p>
              <h2 className="mt-3 text-[1.95rem] font-semibold tracking-[-0.05em] text-white">
                Size özel çalışma alanına hoş geldiniz
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Hesabınıza tanımlanan e-posta ve şifre ile giriş yapın. İlk
                kullanımda profiliniz ve çalışma bölgeleriniz tamamlanır.
              </p>
            </div>

            {errorText && (
              <div className="rounded-[1.1rem] border border-[#5f2328] bg-[#32161a] px-4 py-3 text-sm font-medium text-[#ffd7dc]">
                {errorText}
              </div>
            )}

            <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">
                Başvuru ile açılan kullanım
              </p>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Hesabınız size özel hazırlanır. Giriş sonrası yalnızca size
                tanımlanan bölgelerde çalışırsınız.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[0.77rem] font-semibold uppercase tracking-[0.2em] text-white/42">
                  E-posta
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@firma.com"
                  type="email"
                  className="w-full rounded-[1rem] border border-white/8 bg-[#0c0f14] px-4 py-4 text-[0.98rem] text-white outline-none transition placeholder:text-white/30 focus:border-white/24"
                />
              </div>

              <div>
                <label className="mb-2 block text-[0.77rem] font-semibold uppercase tracking-[0.2em] text-white/42">
                  Şifre
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Şifrenizi girin"
                  className="w-full rounded-[1rem] border border-white/8 bg-[#0c0f14] px-4 py-4 text-[0.98rem] text-white outline-none transition placeholder:text-white/30 focus:border-white/24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-[1.1rem] bg-white px-5 py-4 text-[0.98rem] font-semibold text-[#111315] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>

              <div className="flex items-center justify-between gap-3 text-sm text-white/48">
                <p>İlk girişte kısa profil kurulumu tamamlanır.</p>
                <Link href="/" className="font-medium text-white transition hover:opacity-80">
                  Siteye dön
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
