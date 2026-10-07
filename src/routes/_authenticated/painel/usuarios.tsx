import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Pill } from "@/components/panel";
import { PageHeader, DataTableFrame, tableCellClass, tableHeadClass, tableRowClass } from "@/components/product-ui";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — CRM 377" }, { name: "description", content: "Usuários no CRM 377." }, { property: "og:title", content: "Usuários — CRM 377" }, { property: "og:description", content: "Usuários no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Acesso"
        title="Usuários"
        description="Papéis, vínculo por loja e princípio de menor privilégio para a operação."
      />
      <RoleGate min="admin">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.membersQuery(storeId));
  return (
    <DataTableFrame>
      <QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum membro" />}>
        {(d) => (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className={tableHeadClass}>
                <tr>
                  <th className="h-9 px-4 font-medium">Nome</th>
                  <th className="h-9 px-4 font-medium">E-mail</th>
                  <th className="h-9 px-4 text-right font-medium">Papel</th>
                </tr>
              </thead>
              <tbody>
                {d.map(({ member, profile }) => (
                  <tr key={member.id} className={tableRowClass}>
                    <td className={tableCellClass + " font-medium"}>{profile?.full_name ?? "—"}</td>
                    <td className={tableCellClass + " font-mono text-[10.5px] text-muted-foreground"}>{F.maskEmail(profile?.email)}</td>
                    <td className={tableCellClass + " text-right"}><Pill>{F.ROLE_LABEL[member.role]}</Pill></td>
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
