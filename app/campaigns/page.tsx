"use client";

import CampaignPanel from "@/components/CampaignPanel";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function CampaignsPage() {
  return (
    <DashboardPageShell
      title="Kampanya Olustur"
      description="Taslaklari kampanyaya cevir, testi gonder, canliya al."
      loadingMessage="Kampanya ekrani hazirlaniyor..."
    >
      {({ session }) => <CampaignPanel session={session} />}
    </DashboardPageShell>
  );
}
