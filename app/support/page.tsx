"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import SupportPanel from "@/components/SupportPanel";

export default function SupportPage() {
  return (
    <DashboardPageShell
      title="Bize Ulasin"
      description="Kullanim destegi, hata bildirimi ve yeni ozellik onerileri icin yardim merkezi."
      loadingMessage="Destek ekrani hazirlaniyor..."
    >
      {() => <SupportPanel />}
    </DashboardPageShell>
  );
}
