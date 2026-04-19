"use client";

import CampaignPanel from "@/components/CampaignPanel";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function WorkspaceCampaignsPage() {
  return (
    <DashboardPageShell
      title="Kampanyalar"
      description="Seçimleri kampanyaya çevir, test et ve gönderimi yönet."
      loadingMessage="Kampanya ekranı hazırlanıyor..."
    >
      {({ session }) => <CampaignPanel session={session} />}
    </DashboardPageShell>
  );
}
