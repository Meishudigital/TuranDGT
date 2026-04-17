"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import RecentListingsPanel from "@/components/RecentListingsPanel";

export default function NewListingsPage() {
  return (
    <DashboardPageShell
      title="Yeni Ilanlar"
      description="Yetkili oldugun illerde sisteme yeni dusen ilanlari tek listede goruntule."
      loadingMessage="Yeni ilanlar ekrani hazirlaniyor..."
    >
      {({ session }) => <RecentListingsPanel session={session} />}
    </DashboardPageShell>
  );
}
