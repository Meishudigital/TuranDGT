"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import RecentListingsPanel from "@/components/RecentListingsPanel";

export default function WorkspaceNewListingsPage() {
  return (
    <DashboardPageShell
      title="Yeni İlanlar"
      description="Yetkili bölgelerindeki son eklenen kayıtları izle."
      loadingMessage="Yeni ilanlar ekranı hazırlanıyor..."
    >
      {({ session }) => <RecentListingsPanel session={session} />}
    </DashboardPageShell>
  );
}
