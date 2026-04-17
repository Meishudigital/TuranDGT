"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  note: string;
  badge: string;
};

const primaryNavItems: NavItem[] = [
  {
    href: "/",
    label: "Ilan Bulma",
    note: "Bolge bazli arama ve secim",
    badge: "IB",
  },
  {
    href: "/campaigns",
    label: "Kampanya Olustur",
    note: "Hazir secimlerden kampanya kur",
    badge: "KO",
  },
  {
    href: "/automation",
    label: "Otomatik Mesaj",
    note: "WhatsApp entegrasyonu hazirligi",
    badge: "OM",
  },
  {
    href: "/new-listings",
    label: "Yeni Ilanlar",
    note: "Son eklenen kayitlari takip et",
    badge: "YI",
  },
  {
    href: "/support",
    label: "Bize Ulasin",
    note: "Yardim ve oneriler",
    badge: "BU",
  },
];

const secondaryNavItems: NavItem[] = [
  {
    href: "/profile",
    label: "Profil",
    note: "Hesap ve bolge ayarlari",
    badge: "PR",
  },
];

function getInitials(firstName: string | null | undefined, lastName: string | null | undefined) {
  const source = `${firstName || ""} ${lastName || ""}`.trim();

  if (!source) {
    return "EM";
  }

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`sidebar-link ${active ? "sidebar-link--active" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <span className={`sidebar-link__badge ${active ? "sidebar-link__badge--active" : ""}`}>
        {item.badge}
      </span>

      {!collapsed && (
        <span className="min-w-0">
          <span className="sidebar-link__title">{item.label}</span>
          <span className="sidebar-link__note">{item.note}</span>
        </span>
      )}
    </Link>
  );
}

export default function AppShell({ title, description, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, regions, signOut, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const fullName = useMemo(() => {
    return `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  }, [profile?.first_name, profile?.last_name]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  };

  const visibleRegions = useMemo(() => {
    return regions.slice(0, 4);
  }, [regions]);

  const hiddenRegionCount = Math.max(0, regions.length - visibleRegions.length);

  return (
    <main className="min-h-screen">
      {mobileMenuOpen && (
        <button
          aria-label="Menuyu kapat"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-[110rem] gap-4 px-4 py-4 md:px-5 md:py-5">
        <aside
          className={`sidebar-shell ${sidebarCollapsed ? "sidebar-shell--collapsed" : ""} ${
            mobileMenuOpen ? "sidebar-shell--open" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="brand-badge">TD</span>

              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="toolbar-title truncate">Turan Digital</p>
                  <p className="toolbar-subtitle truncate">Property SaaS workspace</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="ghost-btn hidden h-10 w-10 items-center justify-center p-0 lg:inline-flex"
              aria-label={sidebarCollapsed ? "Menuyu genislet" : "Menuyu daralt"}
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          <div className="sidebar-group">
            <p className={`sidebar-group__label ${sidebarCollapsed ? "sr-only" : ""}`}>
              Ana menu
            </p>

            <div className="space-y-2">
              {primaryNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={sidebarCollapsed}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
          </div>

          <div className="sidebar-group mt-auto">
            <p className={`sidebar-group__label ${sidebarCollapsed ? "sr-only" : ""}`}>
              Hesap
            </p>

            <div className="space-y-2">
              {secondaryNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={sidebarCollapsed}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>

            <div className="sidebar-account mt-3">
              <div className="sidebar-account__avatar">
                {getInitials(profile?.first_name, profile?.last_name)}
              </div>

              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text-0)]">
                    {fullName || "Musteri hesabi"}
                  </p>
                  <p className="truncate text-xs text-[var(--text-2)]">
                    {user?.email || "Bolge bazli erisim aktif"}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className={`secondary-btn mt-3 w-full justify-center ${sidebarCollapsed ? "px-0" : ""}`}
            >
              {signingOut ? "..." : sidebarCollapsed ? "CIK" : "Cikis Yap"}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="surface-card page-rise rounded-[1.6rem] p-4 md:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="ghost-btn inline-flex h-10 w-10 items-center justify-center p-0 lg:hidden"
                    aria-label="Menuyu ac"
                  >
                    =
                  </button>

                  <div>
                    <p className="section-kicker">Calisma Alani</p>
                    <h1 className="mt-2 text-[clamp(1.55rem,1.36rem+0.8vw,2.15rem)] font-semibold tracking-[-0.04em] text-[var(--text-0)]">
                      {title}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-1)]">
                      {description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[22rem]">
                <div className="compact-stat">
                  <p className="compact-stat__label">Yetkili il</p>
                  <p className="compact-stat__value">{regions.length}</p>
                </div>

                <div className="compact-stat">
                  <p className="compact-stat__label">Aktif hesap</p>
                  <p className="compact-stat__value">{fullName || "Hazir"}</p>
                </div>

                <div className="compact-stat">
                  <p className="compact-stat__label">Erisim durumu</p>
                  <p className="compact-stat__value compact-stat__value--accent">
                    Aktif
                  </p>
                </div>
              </div>
            </div>

            <div className="soft-divider mt-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {visibleRegions.length > 0 ? (
                  <>
                    {visibleRegions.map((item) => (
                      <span key={item.id} className="city-chip city-chip--muted">
                        {item.city}
                      </span>
                    ))}

                    {hiddenRegionCount > 0 && (
                      <span className="city-chip city-chip--muted">
                        +{hiddenRegionCount} il daha
                      </span>
                    )}
                  </>
                ) : (
                  <span className="city-chip city-chip--muted">Henuz il tanimlanmadi</span>
                )}
              </div>
            </div>
          </header>

          <section className="page-rise page-rise-2 flex-1">{children}</section>
        </div>
      </div>
    </main>
  );
}
