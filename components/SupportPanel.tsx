"use client";

const helpTopics = [
  "Filtreleme ve kampanya akisinda destek",
  "Bolge yetkisi veya hesap kurulumu sorulari",
  "Yeni ozellik ve gelistirme onerileri",
];

export default function SupportPanel() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_340px]">
      <section className="surface-card rounded-[1.65rem] p-4 md:p-5">
        <div className="max-w-3xl">
          <p className="section-kicker">Destek Merkezi</p>
          <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
            Yardim, geri bildirim ve yeni ozellik talepleri
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-1)]">
            Kullanim sorulari, hata bildirimi veya yeni ozellik talepleri icin bu
            alani bir destek merkezi gibi kullanabiliriz.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {helpTopics.map((item, index) => (
            <div key={item} className="compact-stat">
              <p className="compact-stat__label">Baslik 0{index + 1}</p>
              <p className="compact-stat__value">{item}</p>
            </div>
          ))}
        </div>

        <div className="surface-subcard mt-5 rounded-[1.35rem] p-4">
          <div className="grid gap-4">
            <div>
              <label className="field-label">En hizli destek yolu</label>
              <input
                readOnly
                value="Mail veya direkt geri bildirim talebi"
                className="field-input opacity-70"
              />
            </div>

            <div>
              <label className="field-label">Not</label>
              <textarea
                readOnly
                value="Bu bolume istersek sonraki asamada gercek bir destek formu, tiket kaydi veya canli yardim akisi ekleyebiliriz."
                rows={5}
                className="field-input resize-none opacity-70"
              />
            </div>
          </div>
        </div>
      </section>

      <aside className="surface-card rounded-[1.65rem] p-4">
        <div className="flex h-full flex-col gap-4">
          <div>
            <p className="section-kicker">Onerilen Basliklar</p>
            <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Hangi konuda yazabilirsin?
            </h2>
          </div>

          <div className="compact-stat">
            <p className="compact-stat__label">Yardim</p>
            <p className="compact-stat__value">Kullanim adimlarini netlestirme</p>
          </div>

          <div className="compact-stat">
            <p className="compact-stat__label">Hata</p>
            <p className="compact-stat__value">Beklenmeyen ekran veya veri problemi</p>
          </div>

          <div className="compact-stat">
            <p className="compact-stat__label">Oneri</p>
            <p className="compact-stat__value">Yeni moduller ve is akisi talepleri</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
