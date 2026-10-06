import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db-types";

// Apenas chaves públicas. Nunca coloque service_role ou segredos aqui.
const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

export type Db = SupabaseClient<Database>;

export const supabase: Db | null =
  url && key
    ? createClient<Database>(url, key, {
        auth: {
          persistSession: typeof window !== "undefined",
          autoRefreshToken: true,
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
        },
      })
    : null;

export class DbNotConnectedError extends Error {
  constructor() {
    super("Banco ainda não conectado.");
    this.name = "DbNotConnectedError";
  }
}

export function requireDb(): Db {
  if (!supabase) throw new DbNotConnectedError();
  return supabase;
}