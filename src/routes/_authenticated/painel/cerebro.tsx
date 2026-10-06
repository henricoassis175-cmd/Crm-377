import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/cerebro")({
  head: () => ({ meta: [{ title: "Agente de IA — CRM 377" }, { name: "description", content: "Agente de IA no CRM 377." }, { property: "og:title", content: "Agente de IA — CRM 377" }, { property: "og:description", content: "Agente de IA no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <RoleGate min="admin">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.promptsQuery(storeId));
  return <Panel title="Versões do prompt"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhuma versão de prompt" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((p) => <tr key={p.id}><td className="px-4 py-2">v{p.version}</td><td className="px-4 py-2"><Pill tone={p.status === "publicado" ? "success" : "neutral"}>{p.status}</Pill></td><td className="px-4 py-2 text-muted-foreground">{F.fmtDateTime(p.created_at)}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}