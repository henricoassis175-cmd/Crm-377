import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Infraestrutura"
        title="Integrações"
        description="Conexões do CRM com banco, automação, canais e modelo de IA. Status só é considerado saudável após teste."
      />
      <RoleGate min="admin">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.integrationsQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhuma integração configurada" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Provider</th>
                  <th className="h-9 px-4 font-medium">Status</th>
                  <th className="h-9 px-4 font-medium">Último teste</th>
                  <th className="h-9 px-4 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {d.map((i) => (
                  <tr key={i.id} className={tableRowClass}>
                    <td className={`${tableCellClass} font-medium capitalize`}>{i.provider}</td>
                    <td className={tableCellClass}><Pill tone={i.status === "testado" ? "success" : i.status === "configurado" ? "warning" : "neutral"}>{i.status.replaceAll("_", " ")}</Pill></td>
                    <td className={`${tableCellClass} font-mono text-[10.5px] text-muted-foreground`}>{F.fmtDateTime(i.last_tested_at)}</td>
                    <td className={`${tableCellClass} max-w-md truncate text-muted-foreground`}>{i.last_test_message ?? "—"}</td>
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
