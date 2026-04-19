"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";

type DashboardPageContext = {
  session: Session;
  allowedCities: string[];
};

type Props = {
  title: string;
  description: string;
  loadingMessage?: string;
  children: (context: DashboardPageContext) => React.ReactNode;
};

export default function DashboardPageShell({
  title,
  description,
  loadingMessage,
  children,
}: Props) {
  const router = useRouter();
  const { isLoading, profile, regions, session } = useAuth();
  const allowedCities = useMemo(() => {
    return regions.map((item) => item.city);
  }, [regions]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!profile?.onboarding_completed || regions.length === 0) {
      router.replace("/onboarding");
    }
  }, [isLoading, profile?.onboarding_completed, regions.length, router, session]);

  if (isLoading || !session || !profile?.onboarding_completed || regions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-white">
        <div className="surface-card surface-card--quiet rounded-[1.2rem] px-5 py-4 text-sm text-[var(--text-2)]">
          {loadingMessage || "Çalışma alanı hazırlanıyor..."}
        </div>
      </main>
    );
  }

  return (
    <AppShell title={title} description={description}>
      {children({ session, allowedCities })}
    </AppShell>
  );
}
