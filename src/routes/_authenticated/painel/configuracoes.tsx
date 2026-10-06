import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — CRM 377" }, { name: "description", content: "Configurações no CRM 377." }, { property: "og:title", content: "Configurações — CRM 377" }, { property: "og:description", content: "Configurações no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  return <Panel title="Loja atual"><p className="p-4 text-[13px] text-muted-foreground">Configurações da loja {storeId} são gerenciadas em Lojas.</p></Panel>;
}