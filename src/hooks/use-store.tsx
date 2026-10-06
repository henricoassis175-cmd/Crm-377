import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { storesQuery } from "@/lib/queries";
import type { Store } from "@/lib/db-types";
import { useAuth } from "./use-auth";

type StoreState = {
  stores: Store[];
  storesLoading: boolean;
  storesError: Error | null;
  currentStore: Store | null;
  storeId: string | null;
  setStoreId: (id: string) => void;
};

const StoreContext = createContext<StoreState | null>(null);
const KEY = "crm377.store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const q = useQuery({ ...storesQuery(), enabled: configured && !!user });
  const [storeId, setStoreIdState] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(KEY);
    if (saved) setStoreIdState(saved);
  }, []);

  const stores = useMemo(() => q.data ?? [], [q.data]);

  useEffect(() => {
    if (!stores.length) return;
    if (!storeId || !stores.some((s) => s.id === storeId)) {
      const first = stores[0];
      if (first) setStoreIdState(first.id);
    }
  }, [stores, storeId]);

  const value = useMemo<StoreState>(() => {
    const currentStore = stores.find((s) => s.id === storeId) ?? null;
    return {
      stores,
      storesLoading: q.isLoading,
      storesError: q.error,
      currentStore,
      storeId: currentStore?.id ?? null,
      setStoreId: (id) => {
        window.sessionStorage.setItem(KEY, id);
        setStoreIdState(id);
      },
    };
  }, [stores, storeId, q.isLoading, q.error]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}