import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel, Pill } from "@/components/panel";
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
      <RoleGate min="admin">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.membersQuery(storeId));
  return <Panel title="Membros da loja"><QueryState query={q} isEmpty={(d) => !d.length} empty={<EmptyState title="Nenhum membro" />}>{(d) => <div className="overflow-x-auto"><table className="w-full text-[13px]"><tbody className="divide-y">{d.map(({ member, profile }) => <tr key={member.id}><td className="px-4 py-2 font-medium">{profile?.full_name ?? "—"}</td><td className="px-4 py-2 text-muted-foreground">{F.maskEmail(profile?.email)}</td><td className="px-4 py-2"><Pill>{F.ROLE_LABEL[member.role]}</Pill></td></tr>)}</tbody></table></div>}</QueryState></Panel>;
}