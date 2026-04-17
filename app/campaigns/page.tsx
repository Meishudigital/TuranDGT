"use client";

import CampaignPanel from "@/components/CampaignPanel";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function CampaignsPage() {
  return (
    <DashboardPageShell
      title="Kampanya Olustur"
      description="Ilan secimlerini kampanyaya donustur, mevcut kampanyalari goruntule ve sil."
      loadingMessage="Kampanya ekrani hazirlaniyor..."
    >
      {({ session }) => <CampaignPanel session={session} />}
    </DashboardPageShell>
  );
}
