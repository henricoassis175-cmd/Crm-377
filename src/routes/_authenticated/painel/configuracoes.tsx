import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, Panel } from "@/components/panel";
import { PageHeader } from "@/components/product-ui";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";

export const Route = createFileRoute("/_authenticated/painel/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — CRM 377" }, { name: "description", content: "Configurações no CRM 377." }, { property: "og:title", content: "Configurações — CRM 377" }, { property: "og:description", content: "Configurações no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Workspace"
        title="Configurações"
        description="Preferências gerais e atalhos para a configuração operacional da loja selecionada."
      />
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  return (
    <Panel title="Loja atual" description="As definições operacionais são mantidas na gestão de lojas.">
      <div className="flex min-h-[112px] flex-col justify-between gap-4 p-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Store ID</p>
          <p className="mt-1 font-mono text-[11px] text-foreground/80">{storeId}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/painel/lojas">Abrir lojas <ArrowUpRight className="size-3" /></Link>
        </Button>
      </div>
    </Panel>
  );
}
