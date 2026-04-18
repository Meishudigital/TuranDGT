"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import SupportPanel from "@/components/SupportPanel";

export default function SupportPage() {
  return (
    <DashboardPageShell
      title="Bize Ulasin"
      description="Destek, hata bildirimi ve ozellik talepleri."
      loadingMessage="Destek ekrani hazirlaniyor..."
    >
      {() => <SupportPanel />}
    </DashboardPageShell>
  );
}
