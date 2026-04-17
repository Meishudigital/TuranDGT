"use client";

import DashboardPageShell from "@/components/DashboardPageShell";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <DashboardPageShell
      title="Profil Ayarlari"
      description="Kimlik ve bolge bilgilerini guncelle, hesabin icin yetkili il listesini yonet."
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
