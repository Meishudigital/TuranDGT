"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import FilterPanel from "@/components/FilterPanel";

export default function WorkspaceHomePage() {
  return (
    <DashboardPageShell
      title="İlan Bul"
      description="Yetkili bölgelerinde ilan ara, seç ve kampanyaya aktar."
      loadingMessage="İlan ekranı hazırlanıyor..."
    >
      {({ session, allowedCities }) => (
        <FilterPanel session={session} allowedCities={allowedCities} />
      )}
    </DashboardPageShell>
  );
}
