"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/components/AuthProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoading, profile, regions, session } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session) {
      router.replace("/login");
      return;
    }

    if (profile?.onboarding_completed && regions.length > 0) {
      router.replace("/");
    }
  }, [isLoading, profile?.onboarding_completed, regions.length, router, session]);

  if (isLoading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-white">
        <div className="surface-card rounded-[1.7rem] px-6 py-5 text-sm text-[var(--text-1)]">
          Profil bilgileri hazirlaniyor...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8 text-white">
      <div className="mx-auto grid max-w-[98rem] gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="surface-card page-rise rounded-[2rem] p-7 md:p-9">
          <div className="max-w-2xl">
            <p className="section-kicker">Hesap Kurulumu</p>
            <h1 className="section-title mt-5">
              Profilini tamamla, paneli kendi bolgene gore kilitle.
            </h1>
            <p className="section-copy mt-5 text-base md:text-lg">
              Bu adim tamamlandiginda sistem sadece sectigin illerdeki ilanlari
              gosterecek. Daha sonra profil ekranindan il ekleyip silebilirsin.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="surface-subcard rounded-[1.5rem] p-5">
              <p className="section-kicker">01</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text-0)]">
                Kimlik bilgisi
              </p>
              <p className="section-copy mt-2">
                Isim ve soy isim bilgisi panel icinde gorunur.
              </p>
            </div>

            <div className="surface-subcard rounded-[1.5rem] p-5">
              <p className="section-kicker">02</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text-0)]">
                Bolge yetkisi
              </p>
              <p className="section-copy mt-2">
                Bir veya birden fazla il secerek erisim alanini belirle.
              </p>
            </div>
          </div>
        </section>

        <div className="page-rise page-rise-2">
          <ProfileForm mode="onboarding" />
        </div>
      </div>
    </main>
  );
}
