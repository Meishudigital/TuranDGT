"use client";

const helpTopics = [
  {
    title: "Kullanım desteği",
    description: "Filtreleme, kampanya ve gönderim akışında destek alın.",
  },
  {
    title: "Hata bildirimi",
    description: "Gördüğün ekran veya veri sorunlarını hızlıca ilet.",
  },
  {
    title: "Özellik önerisi",
    description: "Yeni ekran ve geliştirme taleplerini paylaş.",
  },
];

export default function SupportPanel() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_340px]">
      <section className="surface-card surface-card--section rounded-[1.65rem] p-4 md:p-5">
        <div className="max-w-2xl">
          <p className="section-kicker">İletişim</p>
          <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
            Yardım ve geri bildirim
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
            Yardım almak, hata bildirmek veya yeni bir istek paylaşmak için aşağıdaki
            kanalları kullan.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {helpTopics.map((item) => (
            <div key={item.title} className="surface-subcard surface-subcard--soft rounded-[1.2rem] p-4">
              <p className="field-label mb-2">{item.title}</p>
              <p className="text-sm leading-6 text-[var(--text-1)]">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="surface-subcard surface-subcard--inset rounded-[1.3rem] p-4">
            <p className="field-label mb-2">Mail</p>
            <p className="text-lg font-semibold text-[var(--text-0)]">turandgtl@gmail.com</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
              Başvuru ve detaylı bilgi talepleri bu adres üzerinden alınır.
            </p>
          </div>

          <div className="surface-subcard surface-subcard--inset rounded-[1.3rem] p-4">
            <p className="field-label mb-2">WhatsApp</p>
            <p className="text-lg font-semibold text-[var(--text-0)]">05516633622</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
              Hızlı dönüş için lütfen mesaj atınız.
            </p>
          </div>
        </div>
      </section>

      <aside className="surface-card surface-card--rail rounded-[1.65rem] p-4">
        <div className="flex h-full flex-col gap-4">
          <div>
            <p className="section-kicker">Kısa yol</p>
            <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Hızlı iletişim
            </h2>
          </div>

          <a
            href="mailto:turandgtl@gmail.com"
            className="primary-btn w-full justify-center"
          >
            Mail gönder
          </a>

          <a
            href="https://wa.me/905516633622"
            target="_blank"
            rel="noreferrer"
            className="secondary-btn w-full justify-center"
          >
            WhatsApp ile yaz
          </a>

          <div className="surface-subcard surface-subcard--soft rounded-[1.2rem] p-4">
            <p className="field-label mb-2">Not</p>
            <p className="text-sm leading-6 text-[var(--text-2)]">
              Ekran görüntüsü, sorun yaşadığın alan ve kısa açıklama paylaşırsan daha hızlı
              yardımcı olabiliriz.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
