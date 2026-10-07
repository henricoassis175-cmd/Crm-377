import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Inteligência"
        title="Agente de IA"
        description="Versões do prompt, conhecimento e governança do comportamento comercial do Agente 377."
      />
      <RoleGate min="admin">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.promptsQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhuma versão de prompt" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Versão</th>
                  <th className="h-9 px-4 font-medium">Status</th>
                  <th className="h-9 px-4 text-right font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {d.map((p) => (
                  <tr key={p.id} className={tableRowClass}>
                    <td className={tableCellClass + " font-mono font-medium"}>v{p.version}</td>
                    <td className={tableCellClass}><Pill tone={p.status === "publicado" ? "success" : "neutral"}>{p.status}</Pill></td>
                    <td className={tableCellClass + " text-right font-mono text-[10.5px] text-muted-foreground"}>{F.fmtDateTime(p.created_at)}</td>
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
