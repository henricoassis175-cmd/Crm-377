import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Atendimento humano"
        title="Handoffs"
        description="Transferências iniciadas pelo agente quando a conversa precisa de uma pessoa."
      />
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.handoffsQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum handoff" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Motivo</th>
                  <th className="h-9 px-4 font-medium">Status</th>
                  <th className="h-9 px-4 font-medium">Origem</th>
                  <th className="h-9 px-4 text-right font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {d.map((h) => (
                  <tr key={h.id} className={tableRowClass}>
                    <td className={`${tableCellClass} font-medium`}>{F.MOTIVO_LABEL[h.motivo]}</td>
                    <td className={tableCellClass}><Pill tone={h.status === "pendente" ? "warning" : h.status === "concluido" ? "success" : "neutral"}>{F.HANDOFF_STATUS_LABEL[h.status]}</Pill></td>
                    <td className={`${tableCellClass} text-muted-foreground`}>{h.origem ?? "—"}</td>
                    <td className={`${tableCellClass} text-right font-mono text-[10.5px] text-muted-foreground`}>{F.fmtDateTime(h.created_at)}</td>
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
