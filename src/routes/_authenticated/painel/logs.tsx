import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Governança"
        title="Logs e auditoria"
        description="Trilha de ações administrativas e operacionais para investigação e conformidade."
      />
      <RoleGate min="gestor">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.auditQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum registro" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Ação</th>
                  <th className="h-9 px-4 font-medium">Entidade</th>
                  <th className="h-9 px-4 text-right font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {d.map((a) => (
                  <tr key={a.id} className={tableRowClass}>
                    <td className={`${tableCellClass} font-mono text-[10.5px]`}>{a.action}</td>
                    <td className={tableCellClass}>{a.entity}</td>
                    <td className={`${tableCellClass} text-right font-mono text-[10.5px] text-muted-foreground`}>{F.fmtDateTime(a.created_at)}</td>
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
