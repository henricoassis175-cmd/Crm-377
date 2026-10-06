import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/logs")({
  head: () => ({ meta: [{ title: "Logs e auditoria — CRM 377" }, { name: "description", content: "Logs e auditoria no CRM 377." }, { property: "og:title", content: "Logs e auditoria — CRM 377" }, { property: "og:description", content: "Logs e auditoria no CRM 377." }] }),
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
  const q = useQuery(Q.auditQuery(storeId));
  return <Panel title="Auditoria"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum registro" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((a) => <tr key={a.id}><td className="px-4 py-2 font-mono text-xs">{a.action}</td><td className="px-4 py-2">{a.entity}</td><td className="px-4 py-2 text-muted-foreground">{F.fmtDateTime(a.created_at)}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}