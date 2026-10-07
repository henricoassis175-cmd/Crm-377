import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Oferta comercial"
        title="Catálogo e estoque"
        description="Produtos que o agente pode consultar para responder preço, disponibilidade e contexto de venda."
      />
      <RoleGate min="gestor">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.catalogQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Catálogo vazio" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Produto</th>
                  <th className="h-9 px-4 font-medium">SKU</th>
                  <th className="h-9 px-4 text-right font-medium">Preço</th>
                  <th className="h-9 px-4 text-right font-medium">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {d.map((c) => (
                  <tr key={c.id} className={tableRowClass}>
                    <td className={`${tableCellClass} font-medium`}>{c.name}</td>
                    <td className={`${tableCellClass} font-mono text-[10.5px] text-muted-foreground`}>{c.sku ?? "—"}</td>
                    <td className={`${tableCellClass} text-right font-mono tabular-nums`}>{F.fmtCurrency(c.price)}</td>
                    <td className={`${tableCellClass} text-right`}><Pill tone={(c.stock ?? 0) > 0 ? "success" : "neutral"}>{F.fmtNumber(c.stock)}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>
    </DataTableFrame>
  );
}
