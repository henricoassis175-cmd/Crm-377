import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/db-types";

type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  roleError: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const ROLE_RANK: Record<AppRole, number> = { admin: 3, gestor: 2, operador: 1 };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const { data: sub } = client.auth.onAuthStateChange((_e, s) => setSession(s));
    client.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch((e: unknown) => console.error("[auth] getSession", e))
      .finally(() => setLoading(false));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!supabase || !userId) {
      setRole(null);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) {
          console.error("[auth] user_roles", error.message);
          setRoleError(error.message);
          return;
        }
        const best = (data ?? [])
          .map((r) => r.role)
          .sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])[0];
        setRole(best ?? null);
      });
  }, [userId]);

  const value = useMemo<AuthState>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      role,
      roleError,
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      },
    }),
    [loading, session, role, roleError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

export function hasMinRole(role: AppRole | null, min: AppRole): boolean {
  return role != null && ROLE_RANK[role] >= ROLE_RANK[min];
}