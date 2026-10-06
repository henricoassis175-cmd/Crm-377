import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/consumo-ia")({
  head: () => ({ meta: [{ title: "Consumo de IA — CRM 377" }, { name: "description", content: "Consumo de IA no CRM 377." }, { property: "og:title", content: "Consumo de IA — CRM 377" }, { property: "og:description", content: "Consumo de IA no CRM 377." }] }),
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
  const q = useQuery(Q.usageQuery(storeId, "7d"));
  return <Panel title="Últimos 7 dias"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Sem uso registrado" />}>{(d) => <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4"><div><p className="text-xs text-muted-foreground">Requisições</p><p className="text-xl font-semibold">{F.fmtNumber(d.length)}</p></div><div><p className="text-xs text-muted-foreground">Tokens entrada</p><p className="text-xl font-semibold">{F.fmtNumber(d.reduce((a, r) => a + r.input_tokens, 0))}</p></div><div><p className="text-xs text-muted-foreground">Tokens saída</p><p className="text-xl font-semibold">{F.fmtNumber(d.reduce((a, r) => a + r.output_tokens, 0))}</p></div><div><p className="text-xs text-muted-foreground">Custo</p><p className="text-xl font-semibold">{F.fmtCurrency(d.reduce((a, r) => a + (r.cost_usd ?? 0), 0), "USD")}</p></div></div>}</QueryState></Panel>;
}