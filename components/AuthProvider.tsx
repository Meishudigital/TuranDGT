"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase";
import type { UserProfile, UserRegion } from "@/lib/user-data";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  regions: UserRegion[];
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type CachedUserData = {
  profile: UserProfile | null;
  regions: UserRegion[];
};

function getAuthCacheKey(userId: string) {
  return `emlak-auth-cache:${userId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCachedUserData(value: unknown): CachedUserData | null {
  if (!isRecord(value)) {
    return null;
  }

  const regions = Array.isArray(value.regions)
    ? value.regions.filter((item): item is UserRegion => {
        return (
          isRecord(item) &&
          typeof item.id === "number" &&
          typeof item.user_id === "string" &&
          typeof item.city === "string"
        );
      })
    : [];

  const profile = isRecord(value.profile) && typeof value.profile.id === "string"
    ? {
        id: value.profile.id,
        first_name:
          typeof value.profile.first_name === "string" ? value.profile.first_name : null,
        last_name:
          typeof value.profile.last_name === "string" ? value.profile.last_name : null,
        onboarding_completed: Boolean(value.profile.onboarding_completed),
        created_at:
          typeof value.profile.created_at === "string" ? value.profile.created_at : undefined,
        updated_at:
          typeof value.profile.updated_at === "string" ? value.profile.updated_at : undefined,
      }
    : null;

  return {
    profile,
    regions,
  };
}

function readCachedUserData(userId: string) {
  try {
    const rawValue = window.localStorage.getItem(getAuthCacheKey(userId));

    if (!rawValue) {
      return null;
    }

    return normalizeCachedUserData(JSON.parse(rawValue) as unknown);
  } catch (error) {
    console.error("Failed to read cached auth data", error);
    return null;
  }
}

function writeCachedUserData(userId: string, payload: CachedUserData) {
  window.localStorage.setItem(getAuthCacheKey(userId), JSON.stringify(payload));
}

async function loadUserData(userId: string) {
  const [{ data: profile, error: profileError }, { data: regions, error: regionsError }] =
    await Promise.all([
      supabaseBrowser
        .from("profiles")
        .select("id, first_name, last_name, onboarding_completed, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle(),
      supabaseBrowser
        .from("user_regions")
        .select("id, user_id, city, created_at")
        .eq("user_id", userId),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (regionsError) {
    throw regionsError;
  }

  return {
    profile: profile || null,
    regions: (regions || []).sort((a, b) => a.city.localeCompare(b.city, "tr")),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [regions, setRegions] = useState<UserRegion[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [hasCachedProfileData, setHasCachedProfileData] = useState(false);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setRegions([]);
      setHasCachedProfileData(false);
      return;
    }

    setProfileLoading(true);

    try {
      const nextData = await loadUserData(user.id);
      setProfile(nextData.profile);
      setRegions(nextData.regions);
      setHasCachedProfileData(true);
      writeCachedUserData(user.id, nextData);
    } catch (error) {
      console.error("Failed to refresh profile", error);
      setProfile(null);
      setRegions([]);
      setHasCachedProfileData(false);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: nextSession },
        } = await supabaseBrowser.auth.getSession();

        if (!active) {
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          const cachedData = readCachedUserData(nextSession.user.id);

          if (cachedData) {
            setProfile(cachedData.profile);
            setRegions(cachedData.regions);
            setHasCachedProfileData(true);
          }
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRegions([]);
      setProfileLoading(false);
      setHasCachedProfileData(false);
      return;
    }

    let active = true;

    const loadCurrentUser = async () => {
      const cachedData = readCachedUserData(user.id);

      if (cachedData) {
        setProfile(cachedData.profile);
        setRegions(cachedData.regions);
        setHasCachedProfileData(true);
      } else {
        setHasCachedProfileData(false);
      }

      setProfileLoading(true);

      try {
        const nextData = await loadUserData(user.id);

        if (!active) {
          return;
        }

        setProfile(nextData.profile);
        setRegions(nextData.regions);
        setHasCachedProfileData(true);
        writeCachedUserData(user.id, nextData);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Failed to load profile", error);

        if (!cachedData) {
          setProfile(null);
          setRegions([]);
          setHasCachedProfileData(false);
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        regions,
        isLoading: authLoading || (!!user && profileLoading && !hasCachedProfileData),
        refreshProfile,
        signOut: async () => {
          await supabaseBrowser.auth.signOut();
          setProfile(null);
          setRegions([]);
          setHasCachedProfileData(false);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
