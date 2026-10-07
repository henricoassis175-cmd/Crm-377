import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
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
      <PageHeader
        eyebrow="QA do agente"
        title="Laboratório"
        description="Execuções controladas para validar resposta, contrato, fallback e latência antes de chegar aos canais."
      />
      <RoleGate min="gestor">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.runsQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum teste executado" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Mensagem</th>
                  <th className="h-9 px-4 font-medium">Resultado</th>
                  <th className="h-9 px-4 text-right font-medium">Latência</th>
                </tr>
              </thead>
              <tbody>
                {d.map((r) => (
                  <tr key={r.id} className={tableRowClass}>
                    <td className={tableCellClass + " max-w-xl truncate"}>{r.message_text}</td>
                    <td className={tableCellClass}>{r.valid ? <Pill tone="success">válido</Pill> : <Pill tone="danger">fallback</Pill>}</td>
                    <td className={tableCellClass + " text-right font-mono tabular-nums"}>{F.fmtMs(r.latency_ms)}</td>
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
