import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — CRM 377" }, { name: "description", content: "Integrações no CRM 377." }, { property: "og:title", content: "Integrações — CRM 377" }, { property: "og:description", content: "Integrações no CRM 377." }] }),
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
  const q = useQuery(Q.integrationsQuery(storeId));
  return <Panel title="Integrações"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhuma integração configurada" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((i) => <tr key={i.id}><td className="px-4 py-2 font-medium capitalize">{i.provider}</td><td className="px-4 py-2"><Pill tone={i.status === "testado" ? "success" : "neutral"}>{i.status}</Pill></td><td className="px-4 py-2 text-muted-foreground">{F.fmtDateTime(i.last_tested_at)}</td><td className="px-4 py-2 text-muted-foreground">{i.last_test_message ?? "—"}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}