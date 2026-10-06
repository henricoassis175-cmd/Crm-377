import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/handoffs")({
  head: () => ({ meta: [{ title: "Handoffs — CRM 377" }, { name: "description", content: "Handoffs no CRM 377." }, { property: "og:title", content: "Handoffs — CRM 377" }, { property: "og:description", content: "Handoffs no CRM 377." }] }),
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
  const q = useQuery(Q.handoffsQuery(storeId));
  return <Panel title="Handoffs"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum handoff" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((h) => <tr key={h.id}><td className="px-4 py-2">{F.MOTIVO_LABEL[h.motivo]}</td><td className="px-4 py-2"><Pill>{F.HANDOFF_STATUS_LABEL[h.status]}</Pill></td><td className="px-4 py-2 text-muted-foreground">{h.origem ?? "—"}</td><td className="px-4 py-2 text-muted-foreground">{F.fmtDateTime(h.created_at)}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}