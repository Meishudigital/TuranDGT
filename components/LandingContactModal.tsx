"use client";

import Image from "next/image";
import { useState } from "react";

export function LandingContactModal() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-[620px] overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(180deg,#101318,#1f2731)] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.34)] md:p-7">
        <div className="pointer-events-none absolute right-[-32px] top-[-36px] h-[180px] w-[180px] rounded-full bg-white/8 blur-[70px]" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg font-semibold text-white transition hover:bg-white/10"
          aria-label="Pencereyi kapat"
        >
          ×
        </button>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[410px]">
            <span className="text-[0.76rem] font-bold uppercase tracking-[0.24em] text-white/55">
              Hemen iletişime geçin
            </span>
            <h2 className="mt-4 text-[clamp(1.8rem,1.5rem+0.8vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.05em]">
              Kontenjan, başvuru ve kullanım bilgisi için doğrudan ulaşın.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-7 text-white/72">
              Her il için değerlendirme ayrı yapılır. Uygun görülen başvurular için
              kurulum ve hesap açılışı planlanır.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[1.4rem] border border-white/10 bg-white/6 p-3 md:min-w-[170px] md:flex-col md:items-center">
            <div className="flex h-[84px] w-[62px] items-center justify-center overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,#0d1116,#272f3a)] shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
              <Image
                src="/logo.png"
                alt="Turan DGT logosu"
                width={62}
                height={84}
              />
            </div>
            <div className="min-w-0 md:text-center">
              <strong className="block text-sm font-semibold text-white">Turan DGT</strong>
              <span className="mt-1 block text-xs leading-5 text-white/60">
                Başvuru ile açılan özel kullanım
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-2">
          <a
            href="mailto:turandgtl@gmail.com"
            className="rounded-[1.4rem] border border-white/12 bg-white/8 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <small className="text-[0.74rem] font-bold uppercase tracking-[0.18em] text-white/55">
              Mail
            </small>
            <strong className="mt-3 block text-[1.15rem] font-semibold leading-7">
              turandgtl@gmail.com
            </strong>
            <span className="mt-2 block text-sm leading-6 text-white/72">
              Başvurular ve detaylı bilgi talepleri bu e-posta üzerinden alınır.
            </span>
          </a>

          <a
            href="tel:05516633622"
            className="rounded-[1.4rem] border border-white/12 bg-white/8 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <small className="text-[0.74rem] font-bold uppercase tracking-[0.18em] text-white/55">
              Telefon
            </small>
            <strong className="mt-3 block text-[1.15rem] font-semibold leading-7">
              05516633622
            </strong>
            <span className="mt-2 block text-sm leading-6 text-white/72">
              Başvurular ve bilgiler bu numara üzerinden alınır.
            </span>
          </a>
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap gap-3">
          <a
            href="tel:05516633622"
            className="inline-flex min-w-[150px] items-center justify-center rounded-[1rem] border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-[#111315] transition hover:-translate-y-0.5"
            style={{ color: "#111315" }}
          >
            Telefon ile Ulaş
          </a>
          <a
            href="mailto:turandgtl@gmail.com"
            className="inline-flex min-w-[150px] items-center justify-center rounded-[1rem] border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ color: "#ffffff" }}
          >
            Mail Gönder
          </a>
        </div>
      </div>
    </div>
  );
}
