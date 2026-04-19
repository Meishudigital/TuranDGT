"use client";

import AutomationPanel from "@/components/AutomationPanel";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function WorkspaceAutomationPage() {
  return (
    <DashboardPageShell
      title="Otomatik Mesaj"
      description="WhatsApp bağlantını kaydet, aktif durumu kontrol et ve gönderim sırasını izle."
      loadingMessage="Otomatik mesaj ekranı hazırlanıyor..."
    >
      {({ session }) => <AutomationPanel session={session} />}
    </DashboardPageShell>
  );
}
