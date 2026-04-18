"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <DashboardPageShell
      title="Profil Ayarlari"
      description="Hesap ve bolge ayarlarini guncelle."
      loadingMessage="Profil ekrani hazirlaniyor..."
    >
      {() => (
        <div className="max-w-5xl">
          <ProfileForm mode="profile" />
        </div>
      )}
    </DashboardPageShell>
  );
}
