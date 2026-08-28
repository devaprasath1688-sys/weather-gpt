"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";
import type { UserProfile, LanguageCode, OccupationKey } from "@/types";

export type AuthResult = {
  error: AuthError | Error | null;
  data?: unknown;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Consistent initial state for server and initial client render (prevents hydration mismatch)
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize supabase browser client
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return createBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const isConfigured = Boolean(supabase);

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("supabase_auth_id", userId)
        .single();

      if (error) {
        // Profile may not exist yet if user just signed up
        return;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          state: data.state || "Tamil Nadu",
          district: data.district || "Chennai",
          city: data.city || "",
          latitude: data.latitude ? Number(data.latitude) : 0,
          longitude: data.longitude ? Number(data.longitude) : 0,
          locationSource: "manual",
          occupation: (data.occupation || "student") as OccupationKey,
          language: (data.language || "en") as LanguageCode,
          activityNotes: undefined,
          notificationPreferences: {
            heavyRainfall: true,
            officialClosures: true,
            heatwavesAndDrought: true,
            travelDisruptions: true,
            agriculturalImpact: true,
          },
        };
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      // Offline / Demo Mode session restoration after client mount
      Promise.resolve().then(() => {
        if (!isMounted) return;
        try {
          const savedSession = localStorage.getItem("wgpt_demo_session");
          const savedProfile = localStorage.getItem("wgpt_demo_profile");
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            setUser(parsed.user || null);
            setSession(parsed.session || null);
          }
          if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
          }
        } catch {
          // Ignore parse errors on corrupted local cache
        }
        setLoading(false);
      });
      return () => {
        isMounted = false;
      };
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchUserProfile(initialSession.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      // Demo mode signIn
      if (!email || !password) {
        return { error: new Error("Please enter both email and password.") };
      }

      const demoUser: User = {
        id: `demo-${Date.now()}`,
        app_metadata: { provider: "email" },
        user_metadata: { email },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: email,
        phone: "",
        role: "authenticated",
        updated_at: new Date().toISOString(),
      };

      const demoSession: Session = {
        access_token: `demo-token-${Date.now()}`,
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: `demo-refresh-${Date.now()}`,
        user: demoUser,
      };

      setUser(demoUser);
      setSession(demoSession);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wgpt_demo_session", JSON.stringify({ user: demoUser, session: demoSession }));
        } catch {
          // Ignore storage errors
        }
      }

      return { error: null, data: { user: demoUser, session: demoSession } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error, data };
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>): Promise<AuthResult> => {
    if (!supabase) {
      // Demo / Offline Mode signUp
      if (!email || !email.includes("@")) {
        return { error: new Error("Please enter a valid email address.") };
      }
      if (!password || password.length < 6) {
        return { error: new Error("Password must be at least 6 characters.") };
      }

      const demoUser: User = {
        id: `demo-user-${Date.now()}`,
        app_metadata: { provider: "email" },
        user_metadata: metadata || {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: email,
        phone: "",
        role: "authenticated",
        updated_at: new Date().toISOString(),
      };

      const demoSession: Session = {
        access_token: `demo-token-${Date.now()}`,
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: `demo-refresh-${Date.now()}`,
        user: demoUser,
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        state: "Tamil Nadu",
        district: (metadata?.district as string) || "Chennai",
        city: (metadata?.city as string) || "",
        latitude: (metadata?.latitude as number) || 13.0827,
        longitude: (metadata?.longitude as number) || 80.2707,
        locationSource: "manual",
        occupation: ((metadata?.occupation as OccupationKey) || "student"),
        language: ((metadata?.language as LanguageCode) || "en"),
        activityNotes: (metadata?.full_name as string) || undefined,
        notificationPreferences: {
          heavyRainfall: true,
          officialClosures: true,
          heatwavesAndDrought: true,
          travelDisruptions: true,
          agriculturalImpact: true,
        },
      };

      setUser(demoUser);
      setSession(demoSession);
      setUserProfile(demoProfile);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wgpt_demo_session", JSON.stringify({ user: demoUser, session: demoSession }));
          localStorage.setItem("wgpt_demo_profile", JSON.stringify(demoProfile));
        } catch {
          // Ignore storage errors
        }
      }

      return { error: null, data: { user: demoUser, session: demoSession } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    return { error, data };
  }, [supabase]);

  const signOut = useCallback(async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setUserProfile(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("wgpt_demo_session");
        localStorage.removeItem("wgpt_demo_profile");
      } catch {
        // Ignore storage errors
      }
    }
  }, [supabase]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user?.id && supabase) {
      await fetchUserProfile(user.id);
    }
  }, [user, supabase, fetchUserProfile]);

  const value = useMemo(
    () => ({
      user,
      session,
      userProfile,
      loading,
      isConfigured,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, session, userProfile, loading, isConfigured, signIn, signUp, signOut, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}