import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/documentacao")({
  head: () => ({ meta: [{ title: "Documentação — CRM 377" }, { name: "description", content: "Documentação no CRM 377." }, { property: "og:title", content: "Documentação — CRM 377" }, { property: "og:description", content: "Documentação no CRM 377." }] }),
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
  void storeId;
  return <Panel title="Contrato do Agente 377"><pre className="overflow-x-auto p-4 text-xs">{`{ "resposta", "temperatura_lead", "estagio", "acao", "motivo_handoff" }`}</pre></Panel>;
}