import Image from "next/image";
import Link from "next/link";
import { LandingContactModal } from "@/components/LandingContactModal";

const menuItems = [
  { href: "#cozum", label: "Çözüm" },
  { href: "#surec", label: "Süreç" },
  { href: "#moduller", label: "Modüller" },
  { href: "#iletisim", label: "İletişim" },
];

const highlights = [
  {
    title: "İl bazlı sınırlı erişim",
    copy: "Her kullanıcı sadece kendi yetkili bölgesinde çalışır.",
  },
  {
    title: "Tek yerden kampanya yönetimi",
    copy: "İlan seçimi, hazırlık ve mesaj süreci dağılmadan ilerler.",
  },
  {
    title: "Müşteri hazır görünüm",
    copy: "Dışarıda kurumsal site, içeride düzenli çalışma alanı.",
  },
];

const solutionCards = [
  {
    title: "Bölgeye göre çalışan sistem",
    copy: "Kullanıcı hangi şehirlerde yetkiliyse yalnızca o bölgelerdeki ilanları görür ve onlarla çalışır.",
  },
  {
    title: "Daha düzenli kampanya akışı",
    copy: "Uygun kayıtları ayırın, mesaj metnini hazırlayın ve süreci tek panel üzerinden yönetin.",
  },
  {
    title: "Ekibe anlatması kolay yapı",
    copy: "Karmaşık ekranlar yerine net adımlar ve kolay takip edilen çalışma düzeni sunar.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Başvuru değerlendirilir",
    copy: "Her il için kullanım planı ayrı ele alınır ve kontenjan buna göre açılır.",
  },
  {
    step: "02",
    title: "Yetkili bölgeler tanımlanır",
    copy: "Kullanıcının hangi il ve bölgelerde çalışacağı sisteme özel olarak işlenir.",
  },
  {
    step: "03",
    title: "İlanlar seçilir ve kampanya hazırlanır",
    copy: "Uygun kayıtlar bulunur, seçilir ve mesaj süreci tek akışta hazırlanır.",
  },
  {
    step: "04",
    title: "İletişim düzenli şekilde başlatılır",
    copy: "Ekip aynı yapı üzerinden ilerlediği için iş takibi daha güçlü hale gelir.",
  },
];

const moduleCards = [
  {
    tag: "Filtreleme",
    title: "İlan Bulma",
    copy: "Yetkili bölgelerdeki ilanları hızlıca bulur ve seçime hazır hale getirir.",
  },
  {
    tag: "Hazırlık",
    title: "Kampanya Oluştur",
    copy: "Seçilen kayıtları tek kampanyada toplar ve mesaj düzenini korur.",
  },
  {
    tag: "İletişim",
    title: "Otomatik Mesaj",
    copy: "Mesaj sürecini kontrollü ve daha profesyonel biçimde ilerletmeye yardımcı olur.",
  },
  {
    tag: "Takip",
    title: "Yeni İlanlar",
    copy: "Yeni gelen kayıtları ayrı başlıkta tutar ve fırsatları kaçırmayı azaltır.",
  },
];

const faqItems = [
  {
    question: "Sisteme herkes kayıt olabilir mi?",
    answer:
      "Hayır. Kullanım başvuru usulü ile ilerler ve her il için sınırlı kontenjanla açılır.",
  },
  {
    question: "Kullanıcılar tüm ilanları görebilir mi?",
    answer:
      "Hayır. Her kullanıcı yalnızca kendisine tanımlanan bölgelerdeki kayıtları görür.",
  },
  {
    question: "Kurulum desteği veriliyor mu?",
    answer:
      "Evet. Başvuru sonrasında hesap açılışı, bölge tanımı ve kullanım düzeni birlikte planlanır.",
  },
  {
    question: "Kimler için uygun?",
    answer:
      "Bölgesel çalışan emlak ofisleri, danışman ekipleri ve iletişim sürecini düzene almak isteyen yapılar için uygundur.",
  },
];

const contactCards = [
  {
    label: "Mail",
    value: "turandgtl@gmail.com",
    copy: "Başvurular ve detaylı bilgi talepleri bu e-posta üzerinden alınır.",
    href: "mailto:turandgtl@gmail.com",
  },
  {
    label: "Telefon",
    value: "05516633622",
    copy: "Başvurular ve bilgiler bu numara üzerinden alınır.",
    href: "tel:05516633622",
  },
];

function RegionIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function CampaignIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M18 8.5a3 3 0 0 1 0 6" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f3f0] text-[#111315]">
      <LandingContactModal />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_20%),radial-gradient(circle_at_top_right,rgba(17,19,24,0.06),transparent_26%),linear-gradient(180deg,#f7f7f4_0%,#f1f2ef_50%,#ebede9_100%)]" />
      <div className="pointer-events-none absolute left-[-140px] top-20 h-[340px] w-[340px] rounded-full bg-black/5 blur-[95px]" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-[360px] w-[360px] rounded-full bg-white/60 blur-[95px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-4 pb-12 pt-4 md:px-6">
        <header className="sticky top-4 z-40 rounded-[1.6rem] border border-black/8 bg-white/80 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm md:px-5">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="mr-auto inline-flex min-w-0 items-center gap-3">
              <span className="inline-flex h-[70px] w-[52px] items-center justify-center overflow-hidden rounded-[1rem] border border-black/10 bg-[linear-gradient(180deg,#111317,#242932)] shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
                <Image
                  src="/logo.png"
                  alt="Turan DGT logosu"
                  width={52}
                  height={70}
                  preload
                />
              </span>

              <span className="grid gap-1">
                <strong className="text-[0.98rem] leading-none text-[#121418]">
                  Turan DGT
                </strong>
                <small className="text-[0.8rem] leading-none text-[#626b78]">
                  Emlak iletişim ve kampanya sistemi
                </small>
              </span>
            </Link>

            <nav className="order-3 flex w-full items-center gap-4 overflow-x-auto pb-1 text-[0.92rem] font-medium text-[#55606f] md:order-none md:w-auto md:pb-0">
              {menuItems.map((item) => (
                <a key={item.href} href={item.href} className="whitespace-nowrap hover:text-[#111315]">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center rounded-[1rem] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#111315] transition hover:-translate-y-0.5 md:flex-none"
              >
                Giriş
              </Link>
              <a
                href="#iletisim"
                className="inline-flex min-w-[132px] flex-1 items-center justify-center rounded-[1rem] border border-black/10 bg-[linear-gradient(180deg,#181c22,#0a0d11)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 md:flex-none"
                style={{ color: "#ffffff" }}
              >
                İletişime Geçin
              </a>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="max-w-[620px]">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#6b7380] shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
              Başvuru ile açılan özel kullanım
            </span>

            <h1 className="mt-6 text-[clamp(3rem,2.2rem+2.8vw,5rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-[#111315]">
              Emlak ekipleri için
              <br />
              daha düzenli ve
              <br />
              daha satış odaklı bir sistem.
            </h1>

            <p className="mt-6 max-w-[600px] text-[1.05rem] leading-8 text-[#5c6572]">
              İlanları bulun, uygun kayıtları ayırın, kampanyalarınızı hazırlayın
              ve iletişim sürecini tek yapı içinde yönetin. Dışarıda güçlü bir
              vitrin, içeride düzenli bir çalışma alanı sunar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#iletisim"
                className="inline-flex min-w-[132px] items-center justify-center rounded-[1rem] border border-black/10 bg-[linear-gradient(180deg,#181c22,#090b0f)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5"
                style={{ color: "#ffffff" }}
              >
                Başvuru Al
              </a>
              <Link
                href="/login"
                className="inline-flex min-w-[132px] items-center justify-center rounded-[1rem] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#111315] transition hover:-translate-y-0.5"
                style={{ color: "#111315" }}
              >
                Müşteri Girişi
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-black/8 bg-white/75 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.05)]"
                >
                  <strong className="block text-[0.96rem] leading-6 text-[#171a20]">
                    {item.title}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-[#66707e]">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative min-h-[660px]">
            <div className="absolute right-0 top-0 w-full max-w-[690px] overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,#171b21,#0b0e13)] shadow-[0_36px_90px_rgba(0,0,0,0.18)]">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/8 bg-white/[0.03] px-5 py-4">
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                </div>
                <div className="text-sm font-semibold text-white">Özel panel görünümü</div>
                <div className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white">
                  Hazır
                </div>
              </div>

              <div className="grid min-h-[520px] md:grid-cols-[170px_minmax(0,1fr)]">
                <aside className="hidden border-r border-white/8 bg-white/[0.02] p-4 md:flex md:flex-col md:gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#ffffff,#d9dee6)] text-sm font-bold tracking-[0.08em] text-[#111315]">
                    TD
                  </span>
                  <span className="rounded-[1rem] bg-white/8 px-4 py-3 text-sm font-medium text-white">
                    İlan Bulma
                  </span>
                  <span className="rounded-[1rem] px-4 py-3 text-sm font-medium text-white/65">
                    Kampanya Oluştur
                  </span>
                  <span className="rounded-[1rem] px-4 py-3 text-sm font-medium text-white/65">
                    Otomatik Mesaj
                  </span>
                  <span className="rounded-[1rem] px-4 py-3 text-sm font-medium text-white/65">
                    Yeni İlanlar
                  </span>
                </aside>

                <div className="grid gap-4 p-4 md:p-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                      <small className="block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/55">
                        Yetkili bölge
                      </small>
                      <strong className="mt-2 block text-sm font-semibold text-white">
                        İzmir / Bornova
                      </strong>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                      <small className="block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/55">
                        Seçili kayıt
                      </small>
                      <strong className="mt-2 block text-sm font-semibold text-white">
                        18 ilan
                      </strong>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                      <small className="block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/55">
                        Hazır kampanya
                      </small>
                      <strong className="mt-2 block text-sm font-semibold text-white">
                        1 aktif taslak
                      </strong>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <strong className="text-[0.98rem] font-semibold text-white">
                        Bugün incelenen ilanlar
                      </strong>
                      <span className="text-xs text-white/55">Seçime uygun görünüm</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
                      <div>
                        <strong className="block text-sm font-semibold text-white">
                          3+1 satılık daire
                        </strong>
                        <span className="mt-1 block text-xs text-white/55">
                          Kazımdirik / Sahibinden
                        </span>
                      </div>
                      <b className="text-sm font-semibold text-white">TL 6.450.000</b>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
                      <div>
                        <strong className="block text-sm font-semibold text-white">
                          Yatırımlık ofis
                        </strong>
                        <span className="mt-1 block text-xs text-white/55">
                          Bornova merkez / Yeni kayıt
                        </span>
                      </div>
                      <b className="text-sm font-semibold text-white">TL 4.980.000</b>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                      <div>
                        <strong className="block text-sm font-semibold text-white">
                          Köşe başı dükkân
                        </strong>
                        <span className="mt-1 block text-xs text-white/55">
                          Bayraklı sınırı / Portföyde
                        </span>
                      </div>
                      <b className="text-sm font-semibold text-white">TL 8.900.000</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-28 left-0 grid w-full max-w-[360px] grid-cols-[120px_minmax(0,1fr)] items-center gap-4 rounded-[1.6rem] border border-black/10 bg-white/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
              <div className="flex h-[180px] items-center justify-center overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,#0f1216,#242a33)]">
                <Image src="/logo.png" alt="" width={120} height={180} />
              </div>
              <div>
                <small className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#758092]">
                  Turan DGT
                </small>
                <strong className="mt-2 block text-base font-semibold leading-6 text-[#171a20]">
                  Başvuru ile açılan özel kullanım
                </strong>
                <span className="mt-2 block text-sm leading-6 text-[#5f6876]">
                  İl bazlı değerlendirme ve kontrollü hesap açılışı ile ilerler.
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 w-full max-w-[250px] rounded-[1.6rem] border border-black/10 bg-white/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
              <small className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#758092]">
                İletişim akışı
              </small>
              <strong className="mt-2 block text-base font-semibold leading-6 text-[#171a20]">
                Mesaj süreci hazır
              </strong>
              <span className="mt-2 block text-sm leading-6 text-[#5f6876]">
                Kampanya hazırlığı ile gönderim aynı düzen içinde ilerler.
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {solutionCards.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.7rem] border border-black/8 bg-white/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#111317,#2b323d)] shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
                {item.title === "Bölgeye göre çalışan sistem" ? (
                  <RegionIcon />
                ) : item.title === "Daha düzenli kampanya akışı" ? (
                  <CampaignIcon />
                ) : (
                  <TeamIcon />
                )}
              </span>
              <h2 className="mt-5 text-[1.08rem] font-semibold leading-7 text-[#171a20]">
                {item.title}
              </h2>
              <p className="mt-3 text-[0.96rem] leading-7 text-[#606a79]">{item.copy}</p>
            </article>
          ))}
        </section>

        <section
          id="cozum"
          className="mt-14 rounded-[2.2rem] border border-black/8 bg-white/65 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)] md:p-8"
        >
          <div className="max-w-[720px]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#6b7380]">
              Çözüm
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,1.8rem+1vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#111315]">
              Tek tek araçlarla uğraşmadan, tek sistemle ilerleyin.
            </h2>
            <p className="mt-4 max-w-[680px] text-[1rem] leading-8 text-[#5f6876]">
              Dışarıdaki ziyaretçi güçlü bir web sitesi görür, içeri alınan
              kullanıcı ise düzenli bir panel ile çalışır. Böylece satış dili ve
              operasyon düzeni tek markada birleşir.
            </p>
          </div>
        </section>

        <section id="surec" className="mt-14 grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)_320px]">
          <div className="max-w-[620px]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#6b7380]">
              Süreç
            </span>
            <h2 className="mt-4 text-[clamp(2.1rem,1.7rem+0.9vw,3rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#111315]">
              Kullanımı kolay, ekibe anlatması daha da kolay bir yapı.
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#5f6876]">
              Ziyaretçi başvuru ile içeri alınır, kullanıcı hesabı açılır ve
              günlük çalışma tek akışta sürer.
            </p>
          </div>

          <div className="grid gap-4">
            {processSteps.map((item) => (
              <article
                key={item.step}
                className="grid gap-4 rounded-[1.7rem] border border-black/8 bg-white/75 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)] md:grid-cols-[72px_minmax(0,1fr)]"
              >
                <span className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-[1.2rem] bg-[linear-gradient(180deg,#14181f,#07090d)] text-sm font-bold tracking-[0.1em] text-white">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-[1.04rem] font-semibold leading-7 text-[#171a20]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.94rem] leading-7 text-[#606a79]">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[1.9rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#6b7380]">
              Öne çıkan yapı
            </span>
            <h3 className="mt-4 text-[1.35rem] font-semibold leading-8 tracking-[-0.04em] text-[#171a20]">
              Her kullanıcı için ayrı çalışma alanı oluşturulur.
            </h3>
            <p className="mt-3 text-[0.96rem] leading-7 text-[#606a79]">
              Bu yaklaşım hem ekibi daha düzenli çalıştırır hem de hesapları
              yetkili oldukları bölgelerde tutar.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                ["Başvuru ile erişim", "Herkese açık kayıt yerine kontrollü açılış sunar."],
                ["İl bazlı değerlendirme", "Kontenjan ve bölge dengesi korunur."],
                ["Operasyon odaklı kullanım", "İlan, kampanya ve iletişim süreci birleşir."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[1.2rem] border border-black/6 bg-black/[0.03] p-4"
                >
                  <strong className="block text-sm font-semibold text-[#171a20]">{title}</strong>
                  <span className="mt-1 block text-[0.84rem] leading-6 text-[#667080]">
                    {copy}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section
          id="moduller"
          className="mt-14 overflow-hidden rounded-[2.3rem] bg-[linear-gradient(180deg,#101318,#1a2028)] p-6 text-white shadow-[0_32px_70px_rgba(0,0,0,0.16)] md:p-8"
        >
          <div className="max-w-[720px]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-white/60">
              Modüller
            </span>
            <h2 className="mt-4 text-[clamp(2.1rem,1.7rem+0.9vw,3rem)] font-semibold leading-[1.02] tracking-[-0.06em]">
              Her bölüm, günlük iş akışını sadeleştirmek için tasarlandı.
            </h2>
            <p className="mt-4 max-w-[640px] text-[1rem] leading-8 text-white/70">
              Gereksiz kalabalık yerine net başlıklar, düzenli alanlar ve kolay
              anlaşılır akışlar öne çıkar.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid gap-4 sm:grid-cols-2">
              {moduleCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5"
                >
                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/70">
                    {item.tag}
                  </span>
                  <h3 className="mt-4 text-[1.04rem] font-semibold leading-7">{item.title}</h3>
                  <p className="mt-2 text-[0.94rem] leading-7 text-white/70">{item.copy}</p>
                </article>
              ))}
            </div>

            <div className="relative rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/40">
                <div className="flex gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                </div>
                <div className="grid gap-3 p-4">
                  <div className="h-20 rounded-[1rem] bg-white/8" />
                  <div className="h-14 rounded-[1rem] bg-white/8" />
                  <div className="h-14 rounded-[1rem] bg-white/8" />
                  <div className="h-14 rounded-[1rem] bg-[linear-gradient(90deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))]" />
                </div>
              </div>

              <div className="absolute bottom-5 right-5 max-w-[220px] rounded-[1.4rem] bg-white p-4 text-[#111315] shadow-[0_16px_36px_rgba(0,0,0,0.14)]">
                <strong className="block text-[0.98rem] font-semibold">Özel panel</strong>
                <span className="mt-2 block text-sm leading-6 text-[#616875]">
                  Dışarıdan güçlü görünür, içeride daha düzenli çalıştırır.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="iletisim" className="mt-14">
          <div className="max-w-[760px]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#6b7380]">
              İletişime Geçin
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,1.8rem+1vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#111315]">
              Başvuru, kontenjan ve detaylı bilgi için doğrudan ulaşın.
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#5f6876]">
              Her il için değerlendirme ayrı yapılır. Uygun görülen başvurular
              için kurulum ve hesap açılışı planlanır.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {contactCards.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-[1.8rem] border border-black/8 bg-white/78 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)]"
              >
                <small className="text-[0.76rem] font-bold uppercase tracking-[0.18em] text-[#687182]">
                  {item.label}
                </small>
                <strong className="mt-4 block text-[clamp(1.2rem,1rem+0.6vw,1.5rem)] font-semibold leading-8 text-[#13161c]">
                  {item.value}
                </strong>
                <p className="mt-3 text-[0.95rem] leading-7 text-[#606a79]">{item.copy}</p>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-5 rounded-[2rem] bg-[linear-gradient(135deg,#12161d,#2a323e)] p-7 text-white shadow-[0_30px_60px_rgba(0,0,0,0.16)] lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[560px]">
              <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-white/60">
                Turan DGT
              </span>
              <h3 className="mt-3 text-[clamp(1.45rem,1.28rem+0.7vw,2rem)] font-semibold leading-8 tracking-[-0.04em]">
                Müşteriye hazır bir sistem, kontrollü başvuru modeli ile açılır.
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:turandgtl@gmail.com"
                className="inline-flex min-w-[132px] items-center justify-center rounded-[1rem] border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                style={{ color: "#ffffff" }}
              >
                Mail Gönder
              </a>
              <a
                href="tel:05516633622"
                className="inline-flex min-w-[132px] items-center justify-center rounded-[1rem] border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-[#111315] transition hover:-translate-y-0.5"
                style={{ color: "#111315" }}
              >
                Telefon ile Ulaş
              </a>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="max-w-[620px]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#6b7380]">
              Sık Sorulanlar
            </span>
            <h2 className="mt-4 text-[clamp(2rem,1.7rem+0.8vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#111315]">
              Karar sürecinde en çok sorulan başlıklar
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[1.8rem] border border-black/8 bg-white/75 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
              >
                <h3 className="text-[1.04rem] font-semibold leading-7 text-[#171a20]">
                  {item.question}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-[#606a79]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex flex-col gap-3 border-t border-black/8 px-1 pt-6 text-[#5f6876] md:flex-row md:items-center md:justify-between">
          <div>
            <strong className="block text-[0.98rem] font-semibold text-[#15181e]">
              Turan DGT
            </strong>
            <span className="mt-1 block text-sm">Emlak iletişim ve kampanya sistemi</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <a href="mailto:turandgtl@gmail.com" className="hover:text-[#111315]">
              turandgtl@gmail.com
            </a>
            <a href="tel:05516633622" className="hover:text-[#111315]">
              05516633622
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
