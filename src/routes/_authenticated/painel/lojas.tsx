import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
import { QueryState, EmptyState } from "@/components/data-state";
import { RoleGate } from "@/components/role-gate";
import { useAuth } from "@/hooks/use-auth";
import * as Q from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/painel/lojas")({
  head: () => ({
    meta: [
      { title: "Lojas — CRM 377" },
      { name: "description", content: "Lojas no CRM 377." },
      { property: "og:title", content: "Lojas — CRM 377" },
      { property: "og:description", content: "Lojas no CRM 377." },
    ],
  }),
  component: Page,
});

function Page() {
  const { configured } = useAuth();
  const q = useQuery({ ...Q.storesQuery(), enabled: configured });

  return (
    <PageBody>
      <PageHeader
        eyebrow="Workspace"
        title="Lojas"
        description="Ambientes operacionais isolados, cada um com agente, integrações e permissões próprias."
      />
      <RoleGate min="gestor">
        <DataTableFrame>
          <QueryState
            query={q}
            enabled={configured}
            isEmpty={(d) => !d.length}
            empty={<EmptyState title="Nenhuma loja cadastrada" description="Quando o banco estiver conectado, a primeira loja poderá ser criada por um Administrador Vexa." />}
          >
            {(d) => (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className={tableHeadClass}>
                    <tr>
                      <th className="h-9 px-4 font-medium">Loja</th>
                      <th className="h-9 px-4 font-medium">Agente</th>
                      <th className="h-9 px-4 font-medium">Modelo</th>
                      <th className="h-9 px-4 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.map((s) => (
                      <tr key={s.id} className={tableRowClass}>
                        <td className={tableCellClass + " font-medium"}>{s.store_name}</td>
                        <td className={tableCellClass + " text-muted-foreground"}>{s.agent_name ?? "—"}</td>
                        <td className={tableCellClass + " font-mono text-[10.5px] text-muted-foreground"}>{s.ai_model}</td>
                        <td className={tableCellClass + " text-right"}>
                          <Pill tone={s.agent_paused ? "warning" : "success"}>{s.agent_paused ? "Agente pausado" : "Ativo"}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </QueryState>
        </DataTableFrame>
      </RoleGate>
    </PageBody>
  );
}
