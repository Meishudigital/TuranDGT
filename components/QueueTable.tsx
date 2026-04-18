"use client";

export type QueueItem = {
  id: number;
  campaign_id: number | null;
  listing_id: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  owner_name: string | null;
  message_text: string;
  status: string;
  provider_status?: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  message_campaigns?: {
    id: number;
    name: string;
  } | null;
};

type Props = {
  items: QueueItem[];
};

const statusClasses: Record<string, string> = {
  pending: "status-pill--pending",
  sent: "status-pill--sent",
  failed: "status-pill--failed",
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
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

function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return "Bekliyor";
    case "sent":
      return "Gonderildi";
    case "failed":
      return "Hata";
    default:
      return status || "-";
  }
}

function truncateText(value: string, maxLength = 160) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export default function QueueTable({ items }: Props) {
  const summary = items.reduce(
    (acc, item) => {
      if (item.status === "pending") {
        acc.pending += 1;
      } else if (item.status === "sent") {
        acc.sent += 1;
      } else if (item.status === "failed") {
        acc.failed += 1;
      }

      return acc;
    },
    { pending: 0, sent: 0, failed: 0 }
  );

  return (
    <div className="table-shell">
      <div className="table-top">
        <div className="max-w-2xl">
          <p className="section-kicker">Queue</p>
          <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
            Gonderim kayitlari
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
            Bekleyen, giden ve hatali kayitlar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="metric-chip">
            Toplam <strong className="text-[var(--text-0)]">{items.length}</strong>
          </span>
          <span className="metric-chip">
            Bekleyen <strong className="text-[var(--text-0)]">{summary.pending}</strong>
          </span>
          <span className="metric-chip">
            Gonderildi <strong className="text-[var(--text-0)]">{summary.sent}</strong>
          </span>
          <span className="metric-chip">
            Hata <strong className="text-[var(--text-0)]">{summary.failed}</strong>
          </span>
        </div>
      </div>

      <div className="thin-scroll overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-black/20 text-left">
            <tr>
              <th className="table-head-cell min-w-[96px]">Queue</th>
              <th className="table-head-cell min-w-[220px]">Kampanya</th>
              <th className="table-head-cell min-w-[320px]">Mesaj</th>
              <th className="table-head-cell min-w-[150px]">Durum</th>
              <th className="table-head-cell min-w-[180px]">Zaman</th>
              <th className="table-head-cell min-w-[220px]">Not</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const statusClass =
                statusClasses[item.status] ||
                "border border-white/10 bg-white/5 text-[var(--text-1)]";
              const campaignLabel =
                item.message_campaigns?.name ||
                (item.campaign_id ? `Kampanya #${item.campaign_id}` : "-");

              return (
                <tr key={item.id} className="table-row">
                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="table-cell--strong">#{item.id}</p>
                      <p className="table-cell--muted text-sm">Kayit</p>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="table-cell--strong">{campaignLabel}</p>
                      <p className="text-sm text-[var(--text-2)]">
                        {item.owner_name || "-"}
                      </p>
                      <p className="table-cell--muted text-sm">
                        {item.phone_e164 || item.phone_number || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell">
                    <p
                      className="max-w-[34rem] leading-6 text-[var(--text-1)]"
                      title={item.message_text}
                    >
                      {truncateText(item.message_text)}
                    </p>
                  </td>

                  <td className="table-cell">
                    <span className={`status-pill ${statusClass}`}>
                      {formatStatus(item.status)}
                    </span>
                    <p className="table-cell--muted mt-2 text-sm">
                      Olusturuldu: {formatDate(item.created_at)}
                    </p>
                    {item.provider_status ? (
                      <p className="table-cell--muted mt-1 text-xs uppercase tracking-[0.12em]">
                        {item.provider_status}
                      </p>
                    ) : null}
                  </td>

                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="table-cell--strong">{formatDate(item.sent_at)}</p>
                      <p className="table-cell--muted text-sm">
                        Son guncelleme: {formatDate(item.updated_at)}
                      </p>
                    </div>
                  </td>

                  <td className="table-cell">
                    {item.error_message ? (
                      <p className="leading-6 text-[var(--danger)]">{item.error_message}</p>
                    ) : (
                      <span className="table-cell--muted">-</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  Henuz queue kaydi yok. Yeni kampanyalar burada listelenecek.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
