import type { ReactNode } from "react";
import { Store as StoreIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import type { Store } from "@/lib/db-types";
import { EmptyState, ErrorState, LoadingRows, NotConnectedState } from "./data-state";

/** Garante banco conectado e loja selecionada antes de renderizar dados da loja. */
export function StoreScope({ children }: { children: (storeId: string, store: Store) => ReactNode }) {
  const { configured } = useAuth();
  const { currentStore, storesLoading, storesError, stores } = useStore();
  if (!configured) return <NotConnectedState />;
  if (storesLoading) return <LoadingRows />;
  if (storesError) return <ErrorState />;
  if (!stores.length || !currentStore)
    return (
      <EmptyState
        icon={<StoreIcon className="size-4" />}
        title="Nenhuma loja disponível"
        description="Você ainda não tem acesso a nenhuma loja. Peça a um Administrador Vexa para liberar."
      />
    );
  return <>{children(currentStore.id, currentStore)}</>;
}