"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import FilterPanel from "@/components/FilterPanel";

export default function HomePage() {
  return (
    <DashboardPageShell
      title="Ilan Bulma"
      description="Yetkili iller icindeki ilanlari filtrele, sec ve kampanya akisi icin hazirla."
      loadingMessage="Ilan bulma ekrani hazirlaniyor..."
    >
      {({ session, allowedCities }) => (
        <FilterPanel session={session} allowedCities={allowedCities} />
      )}
    </DashboardPageShell>
  );
}
