import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/laboratorio")({
  head: () => ({ meta: [{ title: "Laboratório — CRM 377" }, { name: "description", content: "Laboratório no CRM 377." }, { property: "og:title", content: "Laboratório — CRM 377" }, { property: "og:description", content: "Laboratório no CRM 377." }] }),
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
  const q = useQuery(Q.runsQuery(storeId));
  return <Panel title="Execuções recentes"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum teste executado" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((r) => <tr key={r.id}><td className="px-4 py-2">{r.message_text}</td><td className="px-4 py-2">{r.valid ? <Pill tone="success">válido</Pill> : <Pill tone="danger">fallback</Pill>}</td><td className="px-4 py-2">{F.fmtMs(r.latency_ms)}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}