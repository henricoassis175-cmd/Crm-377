import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Store = Database["public"]["Tables"]["stores"]["Row"];

interface StoreCtx {
  stores: Store[];
  loading: boolean;
  store: Store | null;
  storeId: string | null;
  setStoreId: (id: string) => void;
  refetch: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

const LS_KEY = "crm377.store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreIdState] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .is("deleted_at", null)
        .order("store_name");
      if (error) throw error;
      return data as Store[];
    },
  });

  const stores = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    if (!stores.length) return;
    const salvo = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
    setStoreIdState((atual) => {
      if (atual && stores.some((s) => s.id === atual)) return atual;
      if (salvo && stores.some((s) => s.id === salvo)) return salvo;
      return stores[0]!.id;
    });
  }, [stores]);

  function setStoreId(id: string) {
    setStoreIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(LS_KEY, id);
  }

  const value: StoreCtx = {
    stores,
    loading: isLoading,
    storeId,
    store: stores.find((s) => s.id === storeId) ?? null,
    setStoreId,
    refetch: () => void refetch(),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStores(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStores precisa estar dentro de StoreProvider");
  return ctx;
}