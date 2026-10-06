import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo — CRM 377" }, { name: "description", content: "Catálogo no CRM 377." }, { property: "og:title", content: "Catálogo — CRM 377" }, { property: "og:description", content: "Catálogo no CRM 377." }] }),
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
  const q = useQuery(Q.catalogQuery(storeId));
  return <Panel title="Catálogo"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Catálogo vazio" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map((c) => <tr key={c.id}><td className="px-4 py-2 font-medium">{c.name}</td><td className="px-4 py-2 font-mono text-xs">{c.sku ?? "—"}</td><td className="px-4 py-2">{F.fmtCurrency(c.price)}</td><td className="px-4 py-2">{F.fmtNumber(c.stock)}</td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}