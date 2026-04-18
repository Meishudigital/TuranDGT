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
        <div className="max-w-2xl">
          <p className="section-kicker">Destek</p>
          <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
            Yardim ve geri bildirim
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
            Sorun, istek veya yeni ozellik taleplerini buradan yonet.
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
              <label className="field-label">Oncelikli kanal</label>
              <input
                readOnly
                value="Mail veya dogrudan geri bildirim"
                className="field-input opacity-70"
              />
            </div>

            <div>
              <label className="field-label">Not</label>
              <textarea
                readOnly
                value="Istersen bir sonraki adimda bunu gercek destek formu, tiket akisi veya canli yardima cevirebiliriz."
                rows={4}
                className="field-input resize-none opacity-70"
              />
            </div>
          </div>
        </div>
      </section>

      <aside className="surface-card rounded-[1.65rem] p-4">
        <div className="flex h-full flex-col gap-4">
          <div>
            <p className="section-kicker">Kategoriler</p>
            <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
              Konu sec
            </h2>
          </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Yardim</p>
              <p className="compact-stat__value">Kullanim akisi</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Hata</p>
              <p className="compact-stat__value">Ekran veya veri sorunu</p>
            </div>

            <div className="compact-stat">
              <p className="compact-stat__label">Oneri</p>
              <p className="compact-stat__value">Yeni modul ve akis</p>
            </div>
          </div>
        </aside>
      </div>
    );
}
