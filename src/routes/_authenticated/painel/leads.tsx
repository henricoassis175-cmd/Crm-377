import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/leads")({
  head: () => ({ meta: [{ title: "Leads e conversas — CRM 377" }, { name: "description", content: "Leads e conversas no CRM 377." }, { property: "og:title", content: "Leads e conversas — CRM 377" }, { property: "og:description", content: "Leads e conversas no CRM 377." }] }),
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
  const q = useQuery(Q.leadsQuery(storeId, { search: "", temperatura: "todas", estagio: "todos" }));
  return <Panel title="Leads"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum lead ainda" description="Leads do Kommo aparecerão aqui." />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map(({ lead, contact }) => <tr key={lead.id}><td className="px-4 py-2 font-medium">{contact?.name ?? "—"}</td><td className="px-4 py-2 font-mono text-xs">{lead.kommo_lead_id ?? "—"}</td><td className="px-4 py-2">{lead.temperatura ? F.TEMPERATURA_LABEL[lead.temperatura] : "—"}</td><td className="px-4 py-2">{lead.estagio ? F.ESTAGIO_LABEL[lead.estagio] : "—"}</td><td className="px-4 py-2 text-muted-foreground">{F.fmtRelative(lead.last_message_at)}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}