"use client";

import { useEffect, useMemo, useRef } from "react";

type Listing = {
  id: string;
  title: string | null;
  owner_name: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  price: number | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  platform: string | null;
  url: string | null;
  last_message_sent_at: string | null;
  last_message_status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  items: Listing[];
  selectedIds: string[];
  currentPage: number;
  onToggleOne: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onPageChange: (page: number) => void;
};

const PAGE_SIZE = 20;

function formatPrice(price: number | null) {
  if (price == null) {
    return "-";
  }

  return `TL ${new Intl.NumberFormat("tr-TR").format(price)}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Henuz mesaj yok";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatStatus(status: string | null) {
  switch (status) {
    case "pending":
      return "Bekliyor";
    case "sent":
      return "Gonderildi";
    case "failed":
      return "Hata";
    default:
      return "Yeni";
  }
}

function getStatusClass(status: string | null) {
  switch (status) {
    case "pending":
      return "status-pill status-pill--pending";
    case "sent":
      return "status-pill status-pill--sent";
    case "failed":
      return "status-pill status-pill--failed";
    default:
      return "status-pill border border-white/10 bg-white/5 text-[var(--text-1)]";
  }
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage + 1 < totalPages) {
    pages.add(currentPage + 1);
  }

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  return Array.from(pages).sort((left, right) => left - right);
}

export default function ListingsTable({
  items,
  selectedIds,
  currentPage,
  onToggleOne,
  onToggleAll,
  onPageChange,
}: Props) {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, items.length);

  const pageItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [endIndex, items, startIndex]);

  const pageIds = useMemo(() => {
    return pageItems.map((item) => item.id);
  }, [pageItems]);

  const allSelected =
    pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.id));

  const pageNumbers = useMemo(() => {
    return buildPageNumbers(safePage, totalPages);
  }, [safePage, totalPages]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    tableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [safePage]);

  return (
    <div ref={tableRef} className="table-shell">
      <div className="table-top">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-kicker">Sonuclar</p>
            {items.length > 0 && (
              <span className="table-meta-pill">
                {safePage}. sayfa / {totalPages}
              </span>
            )}
          </div>

          <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
            Eslestirilen ilan listesi
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-1)]">
            Arama sonucunu tek yerden incele, satirlari sec ve kampanya akisina dahil et.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="metric-chip">
            Toplam kayit: <strong className="text-[var(--text-0)]">{items.length}</strong>
          </span>
          <span className="metric-chip">
            Secili: <strong className="text-[var(--text-0)]">{selectedIds.length}</strong>
          </span>
          <span className="metric-chip">
            Sayfa basi: <strong className="text-[var(--text-0)]">{PAGE_SIZE}</strong>
          </span>
        </div>
      </div>

      <div className="thin-scroll overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-black/20 text-left">
            <tr>
              <th className="table-head-cell w-14">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleAll(pageIds)}
                  disabled={pageItems.length === 0}
                  aria-label="Tum sonuclari sec"
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
              </th>
              <th className="table-head-cell min-w-[280px]">Ilan</th>
              <th className="table-head-cell min-w-[180px]">Kisi</th>
              <th className="table-head-cell min-w-[200px]">Konum</th>
              <th className="table-head-cell min-w-[120px]">Fiyat</th>
              <th className="table-head-cell min-w-[170px]">Durum</th>
              <th className="table-head-cell min-w-[120px]">Aksiyon</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.map((item) => {
              const checked = selectedIds.includes(item.id);

              return (
                <tr
                  key={item.id}
                  className={`table-row ${checked ? "bg-white/[0.03]" : ""}`}
                >
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleOne(item.id)}
                      aria-label={`${item.title || "Ilan"} sec`}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40"
                    />
                  </td>

                  <td className="table-cell">
                    <div className="space-y-2">
                      <p className="table-title text-[0.98rem] font-semibold">
                        {item.title || "Baslik bulunamadi"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="table-meta-pill">
                          {item.platform || "Platform yok"}
                        </span>
                        {item.updated_at && (
                          <span className="text-xs text-[var(--text-2)]">
                            Guncelleme: {formatDate(item.updated_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <p className="table-cell--strong">{item.owner_name || "-"}</p>
                      <p className="table-cell--muted text-sm">
                        {item.phone_number || item.phone_e164 || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <p className="table-cell--strong">{item.city || "-"}</p>
                      <p className="table-cell--muted text-sm leading-6">
                        {[item.district, item.neighborhood].filter(Boolean).join(" / ") || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell table-cell--strong">
                    {formatPrice(item.price)}
                  </td>

                  <td className="table-cell">
                    <div className="space-y-2">
                      <span className={getStatusClass(item.last_message_status)}>
                        {formatStatus(item.last_message_status)}
                      </span>
                      <p className="table-cell--muted text-sm leading-6">
                        {formatDate(item.last_message_sent_at)}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-btn px-3.5 py-2 text-sm"
                      >
                        Ilani Ac
                      </a>
                    ) : (
                      <span className="table-cell--muted">-</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  Filtre sec ve aramayi baslat. Sonuclar burada listelenecek.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-white/8 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[var(--text-2)]">
            {startIndex + 1}-{endIndex} arasi kayitlar gosteriliyor. Toplam {items.length} ilan.
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="ghost-btn px-3.5 py-2 text-sm"
            >
              Onceki
            </button>

            {pageNumbers.map((pageNumber, index) => {
              const previous = pageNumbers[index - 1];
              const shouldShowGap = previous && pageNumber - previous > 1;

              return (
                <div key={pageNumber} className="flex items-center gap-2">
                  {shouldShowGap && (
                    <span className="px-1 text-sm text-[var(--text-2)]">...</span>
                  )}

                  <button
                    onClick={() => onPageChange(pageNumber)}
                    className={
                      safePage === pageNumber
                        ? "primary-btn min-w-[2.6rem] px-3.5 py-2 text-sm"
                        : "secondary-btn min-w-[2.6rem] px-3.5 py-2 text-sm"
                    }
                  >
                    {pageNumber}
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="ghost-btn px-3.5 py-2 text-sm"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
