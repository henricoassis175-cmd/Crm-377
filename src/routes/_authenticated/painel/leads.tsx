import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Operação comercial"
        title="Leads e conversas"
        description="Acompanhe o estágio comercial, a temperatura e a última interação de cada lead."
      />
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.leadsQuery(storeId, { search: "", temperatura: "todas", estagio: "todos" }));
  return (
    <DataTableFrame>
      <QueryState
        query={q}
        isEmpty={(d) => !d.length}
        empty={<EmptyState title="Nenhum lead ainda" description="Leads do Kommo aparecerão aqui." />}
      >
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Contato</th>
                  <th className="h-9 px-4 font-medium">ID Kommo</th>
                  <th className="h-9 px-4 font-medium">Temperatura</th>
                  <th className="h-9 px-4 font-medium">Estágio</th>
                  <th className="h-9 px-4 text-right font-medium">Última mensagem</th>
                </tr>
              </thead>
              <tbody>
                {d.map(({ lead, contact }) => (
                  <tr key={lead.id} className={tableRowClass}>
                    <td className={`${tableCellClass} font-medium`}>{contact?.name ?? "—"}</td>
                    <td className={`${tableCellClass} font-mono text-[10.5px] text-muted-foreground`}>{lead.kommo_lead_id ?? "—"}</td>
                    <td className={tableCellClass}>
                      <Pill tone={lead.temperatura === "quente" ? "primary" : "neutral"}>
                        {lead.temperatura ? F.TEMPERATURA_LABEL[lead.temperatura] : "—"}
                      </Pill>
                    </td>
                    <td className={tableCellClass}>{lead.estagio ? F.ESTAGIO_LABEL[lead.estagio] : "—"}</td>
                    <td className={`${tableCellClass} text-right text-muted-foreground`}>{F.fmtRelative(lead.last_message_at)}</td>
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
