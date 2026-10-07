import { createFileRoute } from "@tanstack/react-router";
import { PageBody, Panel } from "@/components/panel";
import { PageHeader } from "@/components/product-ui";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";

export const Route = createFileRoute("/_authenticated/painel/documentacao")({
  head: () => ({ meta: [{ title: "Documentação — CRM 377" }, { name: "description", content: "Documentação no CRM 377." }, { property: "og:title", content: "Documentação — CRM 377" }, { property: "og:description", content: "Documentação no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Referência"
        title="Central de ajuda"
        description="Contrato operacional e documentação de apoio para trabalhar com o CRM 377."
      />
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  void storeId;
  return (
    <Panel title="Contrato do Agente 377" description="Formato estruturado esperado nas respostas do agente.">
      <div className="p-4">
        <pre className="overflow-x-auto rounded-[8px] bg-[#232226] p-4 font-mono text-[11px] leading-5 text-[#f7f6f2] shadow-ring-md">
          {'{ "resposta", "temperatura_lead", "estagio", "acao", "motivo_handoff" }'}
        </pre>
      </div>
    </Panel>
  );
}
