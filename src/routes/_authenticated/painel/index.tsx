import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PlugZap, Workflow } from "lucide-react";
import { PageBody, Panel, Pill } from "@/components/panel";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({
    meta: [
      { title: "Visão geral — CRM 377" },
      { name: "description", content: "Visão geral operacional do CRM 377." },
      { property: "og:title", content: "Visão geral — CRM 377" },
      { property: "og:description", content: "Visão geral operacional do CRM 377." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const kpis = [
    ["mensagens7d", "Mensagens 7 dias"],
    ["leadsAtivos", "Leads ativos"],
    ["handoffsPendentes", "Handoffs pendentes"],
    ["latencia", "Latência média"],
    ["falhas", "Falhas de integração"],
  ] as const;

  const shortcuts = [
    ["/painel/leads", "Leads e conversas", "Acompanhar o funil e o histórico"],
    ["/painel/handoffs", "Handoffs", "Atendimento humano pendente"],
    ["/painel/catalogo", "Catálogo", "Produtos, preços e estoque"],
    ["/painel/integracoes", "Integrações", "Status das conexões"],
  ] as const;

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Indicadores principais">
        {kpis.map(([k, label]) => (
          <Kpi key={k} storeId={storeId} k={k} label={label} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <LeadDistribution storeId={storeId} />
        <IntegrationHealth storeId={storeId} />
      </div>

      <Panel title="Atalhos operacionais" description="Acesse rapidamente os módulos mais usados.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(([to, label, description]) => (
            <Link
              key={to}
              to={to}
              className="group flex min-h-20 items-center justify-between gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/35 sm:border-r lg:border-b-0"
            >
              <span>
                <strong className="block text-[13px] font-medium">{label}</strong>
                <small className="mt-1 block text-[11px] text-muted-foreground">{description}</small>
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Kpi({
  storeId,
  k,
  label,
}: {
  storeId: string;
  k: Parameters<typeof Q.kpiQuery>[1];
  label: string;
}) {
  const q = useQuery(Q.kpiQuery(storeId, k));
  return (
    <Panel className="card-lift">
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <QueryState query={q}>
          {(v) => (
            <p className="mt-1 text-2xl font-semibold">
              {k === "latencia" ? F.fmtMs(v) : F.fmtNumber(v)}
            </p>
          )}
        </QueryState>
      </div>
    </Panel>
  );
}

function LeadDistribution({ storeId }: { storeId: string }) {
  const q = useQuery(Q.leadDistributionQuery(storeId));
  const temperatures = ["fria", "morna", "quente"] as const;
  const stages = ["abertura", "desenvolvimento", "ancoragem", "pre_fechamento", "handoff"] as const;

  return (
    <Panel title="Funil comercial" description="Distribuição real dos leads ativos.">
      <QueryState
        query={q}
        isEmpty={(rows) => !rows.length}
        empty={<EmptyState title="Nenhum lead ativo" description="A distribuição aparecerá quando houver leads na loja." />}
      >
        {(rows) => (
          <div className="grid md:grid-cols-2">
            <div className="border-b p-4 md:border-r md:border-b-0">
              <p className="mb-3 text-xs font-medium">Temperatura</p>
              <div className="space-y-1">
                {temperatures.map((temperature) => (
                  <div key={temperature} className="flex min-h-9 items-center justify-between border-b last:border-0">
                    <span className="text-[12px] text-muted-foreground">{F.TEMPERATURA_LABEL[temperature]}</span>
                    <Pill>{rows.filter((row) => row.temperatura === temperature).length}</Pill>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4">
              <p className="mb-3 text-xs font-medium">Estágios</p>
              <div className="space-y-1">
                {stages.map((stage) => (
                  <div key={stage} className="flex min-h-9 items-center justify-between border-b last:border-0">
                    <span className="text-[12px] text-muted-foreground">{F.ESTAGIO_LABEL[stage]}</span>
                    <Pill>{rows.filter((row) => row.estagio === stage).length}</Pill>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </Panel>
  );
}

function IntegrationHealth({ storeId }: { storeId: string }) {
  const q = useQuery(Q.integrationsQuery(storeId));

  return (
    <Panel
      title="Saúde das integrações"
      description="Nenhuma conexão é considerada saudável sem teste registrado."
      actions={<PlugZap className="size-4 text-muted-foreground" />}
    >
      <QueryState
        query={q}
        isEmpty={(rows) => !rows.length}
        empty={<EmptyState title="Nenhuma integração configurada" />}
      >
        {(rows) => (
          <div className="divide-y">
            {rows.map((integration) => (
              <Link
                key={integration.id}
                to="/painel/integracoes"
                className="flex min-h-14 items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/35"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-muted/30">
                  <Workflow className="size-3.5 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[12px] font-medium capitalize">{integration.provider}</strong>
                  <small className="block truncate text-[10px] text-muted-foreground">
                    {integration.last_tested_at ? F.fmtDateTime(integration.last_tested_at) : "Nunca testado"}
                  </small>
                </span>
                <Pill tone={integration.status === "testado" ? "success" : integration.status === "configurado" ? "warning" : "neutral"}>
                  {integration.status.replaceAll("_", " ")}
                </Pill>
              </Link>
            ))}
          </div>
        )}
      </QueryState>
    </Panel>
  );
}
