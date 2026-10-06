import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/lojas")({
  head: () => ({ meta: [{ title: "Lojas — CRM 377" }, { name: "description", content: "Lojas no CRM 377." }, { property: "og:title", content: "Lojas — CRM 377" }, { property: "og:description", content: "Lojas no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <RoleGate min="gestor">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.storesQuery());
  void storeId;
  return <Panel title="Lojas"><QueryState query={q} isEmpty={(d) => !d.length}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((s) => <tr key={s.id}><td className="px-4 py-2 font-medium">{s.store_name}</td><td className="px-4 py-2 text-muted-foreground">{s.ai_model}</td><td className="px-4 py-2">{s.agent_paused ? <Pill tone="warning">Agente pausado</Pill> : <Pill tone="success">Ativo</Pill>}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}