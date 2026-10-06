import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PeriodControl, type Period } from "@/components/ui/period-control";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  Layers,
  MessageSquare,
  PlugZap,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useStores } from "@/lib/store-context";
import {
  rotuloEstagio,
  rotuloTemperatura,
  type Estagio,
  type Temperatura,
} from "@/lib/agent-contract";
import { formatDateTime, maskName } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({
    meta: [
      { title: "Visão geral | CRM 377 - Agente Comercial" },
      {
        name: "description",
        content:
          "Indicadores reais de atendimentos, temperatura, handoffs, falhas e latência do agente.",
      },
      { property: "og:title", content: "Visão geral | CRM 377" },
      { property: "og:description", content: "Painel operacional do agente comercial 377." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { storeId, store, stores, loading } = useStores();
  const [period, setPeriod] = useState<Period>("week");
  const periodLabel = period === "today" ? "hoje" : period === "week" ? "7 dias" : "30 dias";
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", storeId, period],
    enabled: !!storeId,
    queryFn: async () => {
      if (!storeId)
        return {
          mensagens: [],
          leads: [],
          handoffs: [],
          eventos: [],
          integracoes: [],
          recentes: [],
        };
      const inicio = new Date();
      if (period === "today") inicio.setHours(0, 0, 0, 0);
      else inicio.setTime(inicio.getTime() - (period === "week" ? 7 : 30) * 24 * 3600 * 1000);
      const desde = inicio.toISOString();
      const [msgs, leads, handoffs, eventos, integracoes, recentes] = await Promise.all([
        supabase
          .from("messages")
          .select("id, latency_ms, created_at")
          .eq("store_id", storeId)
          .gte("created_at", desde),
        supabase.from("leads").select("temperature, stage").eq("store_id", storeId),
        supabase.from("handoffs").select("id, status, created_at").eq("store_id", storeId),
        supabase
          .from("integration_events")
          .select("success, created_at, kind")
          .eq("store_id", storeId)
          .gte("created_at", desde),
        supabase
          .from("integration_settings")
          .select("kind, status, last_tested_at")
          .eq("store_id", storeId),
        supabase
          .from("leads")
          .select("id, temperature, stage, last_message_at, contacts(name)")
          .eq("store_id", storeId)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(5),
      ]);
      const erro = [msgs, leads, handoffs, eventos, integracoes, recentes].find(
        (result) => result.error,
      )?.error;
      if (erro) throw erro;
      return {
        recentes: recentes.data ?? [],
        mensagens: msgs.data ?? [],
        leads: leads.data ?? [],
        handoffs: handoffs.data ?? [],
        eventos: eventos.data ?? [],
        integracoes: integracoes.data ?? [],
      };
    },
  });
  const mensagens = data?.mensagens ?? [];
  const latencias = mensagens
    .map((m) => m.latency_ms)
    .filter((v): v is number => typeof v === "number");
  const latenciaMedia = latencias.length
    ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
    : null;
  const falhas = (data?.eventos ?? []).filter((e) => !e.success).length;
  const pendentes = (data?.handoffs ?? []).filter((h) => h.status === "pendente").length;
  const porTemperatura = (Object.keys(rotuloTemperatura) as Temperatura[]).map((t) => ({
    t,
    n: (data?.leads ?? []).filter((l) => l.temperature === t).length,
  }));
  const porEstagio = (Object.keys(rotuloEstagio) as Estagio[]).map((s) => ({
    s,
    n: (data?.leads ?? []).filter((l) => l.stage === s).length,
  }));
  const cards = [
    {
      label: period === "today" ? "Mensagens hoje" : `Mensagens em ${periodLabel}`,
      valor: mensagens.length,
      nota: "Registradas pelo fluxo n8n",
      icon: MessageSquare,
    },
    {
      label: "Leads ativos",
      valor: data?.leads.length ?? 0,
      nota: "Na loja selecionada",
      icon: Users,
    },
    {
      label: "Handoffs pendentes",
      valor: pendentes,
      nota: "Aguardando atendimento",
      icon: ArrowRightLeft,
    },
    {
      label: "Latência média",
      valor: latenciaMedia === null ? "—" : `${latenciaMedia} ms`,
      nota: falhas ? `${falhas} falha(s) · ${periodLabel}` : `Sem falhas · ${periodLabel}`,
      icon: Clock3,
    },
  ];
  return (
    <AppShell
      title="Visão geral"
      description={store ? store.store_name : "Selecione ou cadastre uma loja"}
    >
      {!loading && !stores.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma loja cadastrada.{" "}
            <Link to="/painel/lojas" className="font-medium text-primary hover:underline">
              Cadastre a loja piloto
            </Link>{" "}
            para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <section className="reveal-in flex flex-col gap-5 pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold text-subtle">CENTRAL DE OPERAÇÕES</p>
              <h1 className="enterprise-title text-foreground">Acompanhe sua operação</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Dados reais de {store?.store_name ?? "sua loja"}, atualizados pelo CRM 377.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/painel/leads">
                <Users className="size-3.5" />
                Ver leads
              </Link>
            </Button>
          </section>
          <Link
            to="/painel/leads"
            className="reveal-in grid min-h-[66px] grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-surface px-3 shadow-xs transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-xs"
          >
            <span className="grid size-8 place-items-center rounded-md bg-primary-soft text-primary">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs text-muted-foreground">
              O que precisa da sua atenção hoje?
            </span>
            <span className="grid size-8 place-items-center rounded-md bg-ink text-primary-foreground">
              <ArrowRight className="size-4" />
            </span>
          </Link>

          <section className="overflow-hidden enterprise-panel">
            <div className="flex min-h-16 flex-wrap gap-3 items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold text-subtle">FUNIL COMERCIAL</p>
                <h3 className="mt-0.5 text-sm font-medium">Distribuição de leads</h3>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/painel/leads">
                  Abrir leads <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-b p-4 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <p className="text-xs font-semibold">Temperatura</p>
                </div>
                <div className="space-y-1">
                  {porTemperatura.map((x) => (
                    <div
                      key={x.t}
                      className="flex h-9 items-center justify-between border-b text-xs last:border-0"
                    >
                      <span className="text-muted-foreground">{rotuloTemperatura[x.t]}</span>
                      <Badge variant="outline">{x.n}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <p className="text-xs font-semibold">Estágios</p>
                </div>
                <div className="space-y-1">
                  {porEstagio.map((x) => (
                    <div
                      key={x.s}
                      className="flex h-9 items-center justify-between border-b text-xs last:border-0"
                    >
                      <span className="text-muted-foreground">{rotuloEstagio[x.s]}</span>
                      <Badge variant="outline">{x.n}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <div className="flex flex-wrap items-center gap-1.5 pb-3">
            <span className="mr-1 text-[11px] text-subtle">Sugestões</span>
            {[
              { label: "Conversas abertas", to: "/painel/leads" },
              { label: "Handoffs pendentes", to: "/painel/handoffs" },
              { label: "Saúde das integrações", to: "/painel/integracoes" },
            ].map((item) => (
              <Button
                key={item.to}
                asChild
                variant="secondary"
                size="sm"
                className="h-7 text-[11px] shadow-none"
              >
                <Link to={item.to}>{item.label}</Link>
              </Button>
            ))}
          </div>

          <section className="reveal-in overflow-hidden enterprise-panel">
            <div className="flex min-h-16 flex-wrap gap-3 items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold text-subtle">DESEMPENHO</p>
                <h3 className="mt-0.5 text-sm font-medium">Resumo comercial</h3>
              </div>
              <PeriodControl value={period} onChange={setPeriod} />
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((c, index) => (
                <article
                  key={c.label}
                  className="min-h-[124px] border-b p-4 transition-colors hover:bg-muted/30 sm:border-r xl:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                    <c.icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <strong className="mt-3 block text-[28px] font-medium">
                    {isLoading ? "…" : c.valor}
                  </strong>
                  <small
                    className={
                      index === 3 && !falhas
                        ? "mt-2 block text-[11px] text-success"
                        : "mt-2 block text-[11px] text-muted-foreground"
                    }
                  >
                    {c.nota}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <div className="reveal-in grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.85fr)]">
            <section className="enterprise-panel overflow-hidden">
              <div className="flex min-h-16 items-center justify-between gap-2 border-b px-4">
                <div>
                  <p className="text-[10px] font-semibold text-subtle">TEMPO REAL</p>
                  <h3 className="mt-0.5 text-sm font-medium">Conversas recentes</h3>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/painel/leads">
                    Ver todas <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <div className="grid min-w-[460px] grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr] gap-3 border-b bg-background px-4 py-3 text-[10px] font-medium uppercase text-muted-foreground">
                  <span>Contato</span>
                  <span>Etapa</span>
                  <span>Status</span>
                  <span>Horário</span>
                </div>
                {(data?.recentes ?? []).map((lead) => (
                  <Link
                    key={lead.id}
                    to="/painel/leads"
                    className="grid min-h-[62px] min-w-[460px] grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr] items-center gap-3 border-b px-4 text-xs transition-colors last:border-0 hover:bg-background"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-[10px] font-semibold text-primary">
                        {maskName(lead.contacts?.name).slice(0, 2).toUpperCase()}
                      </span>
                      <span className="truncate font-medium">{maskName(lead.contacts?.name)}</span>
                    </span>
                    <span className="text-muted-foreground">{rotuloEstagio[lead.stage]}</span>
                    <span>
                      <Badge variant="outline">{rotuloTemperatura[lead.temperature]}</Badge>
                    </span>
                    <time className="text-[10px] text-muted-foreground">
                      {formatDateTime(lead.last_message_at)}
                    </time>
                  </Link>
                ))}
                {!(data?.recentes ?? []).length ? (
                  <p className="px-4 py-10 text-center text-xs text-muted-foreground">
                    {isLoading ? "Carregando…" : "Nenhuma conversa registrada."}
                  </p>
                ) : null}
              </div>
            </section>
            <section className="overflow-hidden enterprise-panel">
              <div className="flex min-h-16 flex-wrap gap-3 items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold text-subtle">INFRAESTRUTURA</p>
                  <h3 className="mt-0.5 text-sm font-medium">Saúde do sistema</h3>
                </div>
                <PlugZap className="size-4 text-muted-foreground" />
              </div>
              <div>
                {(data?.integracoes ?? []).map((i) => (
                  <Link
                    key={i.kind}
                    to="/painel/integracoes"
                    className="grid min-h-14 grid-cols-[32px_1fr_auto_14px] items-center gap-2 border-b px-4 transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <span className="grid size-8 place-items-center rounded-md border bg-muted/30 text-[9px] font-bold uppercase">
                      {i.kind.slice(0, 2)}
                    </span>
                    <span>
                      <strong className="block text-[10px] font-semibold uppercase">
                        {i.kind}
                      </strong>
                      <small className="text-[11px] text-muted-foreground">
                        {i.last_tested_at ? formatDateTime(i.last_tested_at) : "Nunca testado"}
                      </small>
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {i.status === "testado" ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <AlertTriangle className="size-3.5 text-warning" />
                      )}
                      {i.status === "testado"
                        ? "Operacional"
                        : i.status === "configurado"
                          ? "Configurado"
                          : "Pendente"}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
              {!(data?.integracoes ?? []).length ? (
                <p className="p-6 text-center text-xs text-muted-foreground">
                  Nenhuma integração registrada.
                </p>
              ) : null}
            </section>
          </div>

          <section className="reveal-in overflow-hidden enterprise-panel">
            <div className="flex min-h-16 flex-wrap gap-3 items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold text-subtle">ATALHOS</p>
                <h3 className="mt-0.5 text-sm font-medium">Ações frequentes</h3>
              </div>
              <Search className="size-4 text-muted-foreground" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Catálogo", "Produtos e estoque", "/painel/catalogo"],
                  ["Laboratório", "Testar o agente", "/painel/laboratorio"],
                  ["Integrações", "Conferir conexões", "/painel/integracoes"],
                  ["Handoffs", "Atendimento humano", "/painel/handoffs"],
                ] as const
              ).map(([label, detail, to]) => (
                <Link
                  key={to}
                  to={to}
                  className="group min-h-20 border-b p-4 transition-colors hover:bg-muted/40 sm:border-r lg:border-b-0"
                >
                  <span className="flex items-center justify-between text-xs font-semibold">
                    {label}
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <small className="mt-1 block text-[11px] text-muted-foreground">{detail}</small>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}