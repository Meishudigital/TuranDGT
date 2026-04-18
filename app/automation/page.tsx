"use client";

import AutomationPanel from "@/components/AutomationPanel";
import DashboardPageShell from "@/components/DashboardPageShell";

export default function AutomationPage() {
  return (
    <DashboardPageShell
      title="Otomatik Mesaj Gonder"
      description="WhatsApp durumu ve queue kayitlari."
      loadingMessage="Otomatik mesaj ekrani hazirlaniyor..."
    >
      {({ session }) => <AutomationPanel session={session} />}
    </DashboardPageShell>
  );
}
