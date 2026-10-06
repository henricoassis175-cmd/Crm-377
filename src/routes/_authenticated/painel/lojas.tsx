import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
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
      <RoleGate min="gestor">
        <Panel title="Lojas" description="A lista de lojas não depende de uma loja já selecionada.">
          <QueryState
            query={q}
            enabled={configured}
            isEmpty={(d) => !d.length}
            empty={
              <EmptyState
                title="Nenhuma loja cadastrada"
                description="Quando o Supabase estiver conectado, um Administrador Vexa poderá cadastrar a primeira loja sem ficar preso a um seletor vazio."
              />
            }
          >
            {(d) => (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-[13px]">
                  <thead className="border-b bg-muted/30 text-left text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Loja</th>
                      <th className="px-4 py-2 font-medium">Agente</th>
                      <th className="px-4 py-2 font-medium">Modelo</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {d.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2 font-medium">{s.store_name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{s.agent_name ?? "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{s.ai_model}</td>
                        <td className="px-4 py-2">
                          {s.agent_paused ? (
                            <Pill tone="warning">Agente pausado</Pill>
                          ) : (
                            <Pill tone="success">Ativo</Pill>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </QueryState>
        </Panel>
      </RoleGate>
    </PageBody>
  );
}
