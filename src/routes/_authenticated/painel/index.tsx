import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CircleDot,
  PlugZap,
  Workflow,
} from "lucide-react";
import { PageBody, Panel, Pill } from "@/components/panel";
import {
  PageHeader,
  StatGrid,
  StatTile,
} from "@/components/product-ui";
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
      <PageHeader
        eyebrow="Operação comercial"
        title="Visão geral"
        description="Leads, conversas, handoffs e saúde operacional em uma leitura única da loja selecionada."
      />
      <RoleGate min="operador">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const shortcuts = [
    ["/painel/leads", "Leads e conversas", "Acompanhar funil e histórico"],
    ["/painel/handoffs", "Handoffs", "Atendimento humano pendente"],
    ["/painel/catalogo", "Catálogo", "Produtos, preços e estoque"],
    ["/painel/integracoes", "Integrações", "Conexões e eventos"],
  ] as const;

  return (
    <div className="space-y-5">
      <StatGrid>
        <Kpi storeId={storeId} k="mensagens7d" label="Mensagens · 7 dias" hint="Volume processado" />
        <Kpi storeId={storeId} k="leadsAtivos" label="Leads ativos" hint="Em acompanhamento" />
        <Kpi storeId={storeId} k="handoffsPendentes" label="Handoffs" hint="Pendentes agora" />
        <Kpi storeId={storeId} k="latencia" label="Latência média" hint="Respostas do agente" />
        <Kpi storeId={storeId} k="falhas" label="Falhas · 7 dias" hint="Eventos de integração" danger />
      </StatGrid>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.72fr)]">
        <LeadDistribution storeId={storeId} />

        <div className="space-y-5">
          <IntegrationHealth storeId={storeId} />

          <Panel title="Navegação operacional" description="Acesso direto aos fluxos mais usados.">
            <div className="divide-y divide-border/70">
              {shortcuts.map(([to, label, description]) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex min-h-[58px] items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-muted/35"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-muted/70 text-muted-foreground">
                    <ArrowUpRight className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[11.5px] font-medium">{label}</strong>
                    <small className="mt-0.5 block truncate text-[9.5px] text-muted-foreground">
                      {description}
                    </small>
                  </span>
                  <ArrowUpRight className="size-3 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  storeId,
  k,
  label,
  hint,
  danger = false,
}: {
  storeId: string;
  k: Parameters<typeof Q.kpiQuery>[1];
  label: string;
  hint: string;
  danger?: boolean;
}) {
  const q = useQuery(Q.kpiQuery(storeId, k));

  if (q.isLoading) {
    return <StatTile label={label} value="···" hint={hint} />;
  }

  if (q.isError) {
    return <StatTile label={label} value="—" hint="Não foi possível carregar" tone="danger" />;
  }

  const value = q.data;
  return (
    <StatTile
      label={label}
      value={k === "latencia" ? F.fmtMs(value) : F.fmtNumber(value)}
      hint={hint}
      tone={danger && typeof value === "number" && value > 0 ? "danger" : "default"}
    />
  );
}

function LeadDistribution({ storeId }: { storeId: string }) {
  const q = useQuery(Q.leadDistributionQuery(storeId));
  const temperatures = ["fria", "morna", "quente"] as const;
  const stages = ["abertura", "desenvolvimento", "ancoragem", "pre_fechamento", "handoff"] as const;

  return (
    <Panel
      title="Pipeline comercial"
      description="Distribuição dos leads ativos por temperatura e estágio."
      actions={<Pill tone="primary">Tempo real</Pill>}
      className="min-h-[390px]"
    >
      <QueryState
        query={q}
        isEmpty={(rows) => !rows.length}
        empty={
          <EmptyState
            title="Nenhum lead ativo"
            description="A distribuição do pipeline aparecerá quando houver leads na loja."
          />
        }
      >
        {(rows) => {
          const total = rows.length || 1;
          const temperatureCounts = temperatures.map((temperature) => ({
            key: temperature,
            label: F.TEMPERATURA_LABEL[temperature],
            value: rows.filter((row) => row.temperatura === temperature).length,
          }));
          const stageCounts = stages.map((stage) => ({
            key: stage,
            label: F.ESTAGIO_LABEL[stage],
            value: rows.filter((row) => row.estagio === stage).length,
          }));

          return (
            <div className="grid md:grid-cols-[.82fr_1.18fr]">
              <div className="border-b border-border/70 p-5 md:border-b-0 md:border-r">
                <p className="mb-5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                  Temperatura
                </p>
                <div className="space-y-4">
                  {temperatureCounts.map((item) => (
                    <div key={item.key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] text-foreground/85">{item.label}</span>
                        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                          {F.fmtNumber(item.value)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/72 transition-[width] duration-200 ease-out"
                          style={{ width: `${Math.max(3, (item.value / total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                  Estágio do funil
                </p>
                <div className="divide-y divide-border/70">
                  {stageCounts.map((item, index) => (
                    <div key={item.key} className="flex min-h-[52px] items-center gap-3">
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[11.5px]">{item.label}</span>
                      <span className="font-mono text-[13px] font-medium tabular-nums">
                        {F.fmtNumber(item.value)}
                      </span>
                      <span className="w-10 text-right font-mono text-[9.5px] text-muted-foreground">
                        {Math.round((item.value / total) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }}
      </QueryState>
    </Panel>
  );
}

function IntegrationHealth({ storeId }: { storeId: string }) {
  const q = useQuery(Q.integrationsQuery(storeId));

  return (
    <Panel
      title="Saúde das integrações"
      description="Status baseado no último teste registrado."
      actions={<PlugZap className="size-3.5 text-muted-foreground" />}
    >
      <QueryState
        query={q}
        isEmpty={(rows) => !rows.length}
        empty={<EmptyState title="Nenhuma integração configurada" />}
      >
        {(rows) => (
          <div className="divide-y divide-border/70">
            {rows.map((integration) => (
              <Link
                key={integration.id}
                to="/painel/integracoes"
                className="flex min-h-[56px] items-center gap-3 px-4 py-2 transition-colors duration-150 hover:bg-muted/35"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-muted/60">
                  <Workflow className="size-3 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[11px] font-medium capitalize">
                    {integration.provider}
                  </strong>
                  <small className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                    {integration.last_tested_at ? F.fmtDateTime(integration.last_tested_at) : "Nunca testado"}
                  </small>
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleDot
                    className={
                      integration.status === "testado"
                        ? "size-3 text-success"
                        : integration.status === "configurado"
                          ? "size-3 text-warning"
                          : "size-3 text-muted-foreground"
                    }
                  />
                  <span className="text-[9.5px] capitalize text-muted-foreground">
                    {integration.status.replaceAll("_", " ")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </QueryState>
    </Panel>
  );
}
