"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import FilterPanel from "@/components/FilterPanel";

export default function HomePage() {
  return (
    <DashboardPageShell
      title="Ilan Bulma"
      description="Bolge icinde ilan ara ve sec."
      loadingMessage="Ilan bulma ekrani hazirlaniyor..."
    >
      {({ session, allowedCities }) => (
        <FilterPanel session={session} allowedCities={allowedCities} />
      )}
    </DashboardPageShell>
  );
}
