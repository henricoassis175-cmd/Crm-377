import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageBody, Panel } from "@/components/panel";
import { PageHeader, StatGrid, StatTile } from "@/components/product-ui";
import { QueryState, EmptyState } from "@/components/data-state";
import { StoreScope } from "@/components/store-scope";
import { RoleGate } from "@/components/role-gate";
import * as Q from "@/lib/queries";
import * as F from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/consumo-ia")({
  head: () => ({ meta: [{ title: "Consumo de IA — CRM 377" }, { name: "description", content: "Consumo de IA no CRM 377." }, { property: "og:title", content: "Consumo de IA — CRM 377" }, { property: "og:description", content: "Consumo de IA no CRM 377." }] }),
  component: Page,
});

function Page() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Observabilidade"
        title="Consumo de IA"
        description="Uso do modelo, volume de tokens e custo estimado da operação nos últimos sete dias."
      />
      <RoleGate min="gestor">
        <StoreScope>{(storeId) => <Content storeId={storeId} />}</StoreScope>
      </RoleGate>
    </PageBody>
  );
}

function Content({ storeId }: { storeId: string }) {
  const q = useQuery(Q.usageQuery(storeId, "7d"));

  return (
    <Panel variant="ghost">
      <QueryState
        query={q}
        isEmpty={(d) => !d.length}
        empty={<EmptyState title="Sem uso registrado" description="As métricas aparecerão quando o agente começar a processar requisições." />}
      >
        {(d) => {
          const input = d.reduce((a, r) => a + r.input_tokens, 0);
          const output = d.reduce((a, r) => a + r.output_tokens, 0);
          const cost = d.reduce((a, r) => a + (r.cost_usd ?? 0), 0);
          const latencyValues = d.map((r) => r.latency_ms).filter((v): v is number => v != null);
          const latency = latencyValues.length
            ? latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length
            : null;

          return (
            <div className="space-y-5">
              <StatGrid>
                <StatTile label="Requisições" value={F.fmtNumber(d.length)} hint="Últimos 7 dias" />
                <StatTile label="Tokens de entrada" value={F.fmtNumber(input)} hint="Contexto processado" />
                <StatTile label="Tokens de saída" value={F.fmtNumber(output)} hint="Respostas geradas" />
                <StatTile label="Latência média" value={F.fmtMs(latency)} hint="Tempo de resposta" />
                <StatTile label="Custo estimado" value={F.fmtCurrency(cost, "USD")} hint="Período atual" />
              </StatGrid>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Eficiência" description="Relação entre entrada e saída de tokens.">
                  <div className="divide-y divide-border/70">
                    <div className="flex min-h-[56px] items-center justify-between px-4">
                      <span className="text-[11px] text-muted-foreground">Tokens por requisição</span>
                      <span className="font-mono text-[12px] tabular-nums">
                        {F.fmtNumber(d.length ? Math.round((input + output) / d.length) : 0)}
                      </span>
                    </div>
                    <div className="flex min-h-[56px] items-center justify-between px-4">
                      <span className="text-[11px] text-muted-foreground">Proporção saída / entrada</span>
                      <span className="font-mono text-[12px] tabular-nums">
                        {input ? `${((output / input) * 100).toFixed(1)}%` : "—"}
                      </span>
                    </div>
                  </div>
                </Panel>

                <Panel title="Período" description="Janela usada nesta leitura.">
                  <div className="flex min-h-[113px] items-end justify-between p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Janela</p>
                      <p className="mt-1 font-serif text-[24px] tracking-[-0.03em]">7 dias</p>
                    </div>
                    <p className="max-w-[220px] text-right text-[10.5px] leading-4 text-muted-foreground">
                      As métricas são calculadas apenas com registros reais da loja selecionada.
                    </p>
                  </div>
                </Panel>
              </div>
            </div>
          );
        }}
      </QueryState>
    </Panel>
  );
}
