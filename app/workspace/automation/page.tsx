"use client";

import AutomationPanel from "@/components/AutomationPanel";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function WorkspaceAutomationPage() {
  return (
    <DashboardPageShell
      title="Otomatik Mesaj"
      description="WhatsApp bağlantısını ve gönderim sırasını takip et."
      loadingMessage="Otomatik mesaj ekranı hazırlanıyor..."
    >
      {({ session }) => <AutomationPanel session={session} />}
    </DashboardPageShell>
  );
}
