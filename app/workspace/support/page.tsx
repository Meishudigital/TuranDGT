"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import SupportPanel from "@/components/SupportPanel";

export default function WorkspaceSupportPage() {
  return (
    <DashboardPageShell
      title="Bize Ulaşın"
      description="Destek, hata bildirimi ve özellik taleplerini buradan ilet."
      loadingMessage="İletişim ekranı hazırlanıyor..."
    >
      {() => <SupportPanel />}
    </DashboardPageShell>
  );
}
