import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({ meta: [{ title: "Visão geral — CRM 377" }, { name: "description", content: "Visão geral no CRM 377." }, { property: "og:title", content: "Visão geral — CRM 377" }, { property: "og:description", content: "Visão geral no CRM 377." }] }),
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
  const kpis = [["mensagens7d","Mensagens 7 dias"],["leadsAtivos","Leads ativos"],["handoffsPendentes","Handoffs pendentes"],["latencia","Latência média"],["falhas","Falhas de integração"]] as const;
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{kpis.map(([k, label]) => <Kpi key={k} storeId={storeId} k={k} label={label} />)}</div>;
}

function Kpi({ storeId, k, label }: { storeId: string; k: Parameters<typeof Q.kpiQuery>[1]; label: string }) {
  const q = useQuery(Q.kpiQuery(storeId, k));
  return <Panel className="card-lift"><div className="p-4"><p className="text-xs text-muted-foreground">{label}</p><QueryState query={q}>{(v) => <p className="mt-1 text-2xl font-semibold">{k === "latencia" ? F.fmtMs(v) : F.fmtNumber(v)}</p>}</QueryState></div></Panel>;
}