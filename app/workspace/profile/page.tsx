"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import ProfileForm from "@/components/ProfileForm";

export default function WorkspaceProfilePage() {
  return (
    <DashboardPageShell
      title="Profil Ayarları"
      description="Hesap bilgilerini ve yetkili bölgeleri güncelle."
      loadingMessage="Profil ekranı hazırlanıyor..."
    >
      {() => (
        <div className="max-w-5xl">
          <ProfileForm mode="profile" />
        </div>
      )}
    </DashboardPageShell>
  );
}
