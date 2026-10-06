import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, LineChart, Lock, ShieldCheck, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CRM 377 — Agente Comercial inteligente" },
      {
        name: "description",
        content:
          "Camada administrativa e operacional do agente comercial: leads, atendimentos e automações integrados a Kommo, n8n e Claude.",
      },
      { property: "og:title", content: "CRM 377 — Agente Comercial inteligente" },
      {
        property: "og:description",
        content: "Painel seguro para operar seu agente comercial com Kommo, n8n e Claude.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const recursos = [
  {
    icon: Bot,
    titulo: "Agente comercial com IA",
    texto: "Prompts versionados, base de conhecimento e guardrails para conversas consistentes.",
  },
  {
    icon: Workflow,
    titulo: "Automações orquestradas",
    texto: "Gatilhos e webhooks conectando o n8n a cada evento relevante do funil.",
  },
  {
    icon: LineChart,
    titulo: "Operação mensurável",
    texto: "Indicadores de leads, conversão e tempo de resposta em um painel único.",
  },
  {
    icon: Lock,
    titulo: "Segurança por padrão",
    texto: "Papéis separados, políticas por linha no banco e trilha de auditoria.",
  },
];

function Home() {
  return (
    <div className="bg-hero min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold">CRM 377</span>
            <span className="block text-xs text-muted-foreground">Agente Comercial</span>
          </span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Acessar painel</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 md:pt-24">
          <Badge variant="outline" className="border-accent/40 text-accent">
            Kommo · n8n · Claude
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] md:text-6xl">
            A camada de comando do seu <span className="text-gold">agente comercial</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            CRM 377 centraliza leads, atendimentos e automações em um painel seguro — pronto para
            operar o agente de ponta a ponta, com governança de acesso e auditoria.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Entrar no sistema</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Criar conta da equipe</Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map((r) => (
              <article key={r.titulo} className="surface-panel p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  <r.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold">{r.titulo}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{r.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 bg-background/40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="size-4 text-primary" />
              Fundação SaaS pronta: autenticação, papéis, auditoria e design system.
            </p>
            <Button asChild variant="ghost">
              <Link to="/auth">Começar agora</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} CRM 377 — Agente Comercial.
      </footer>
    </div>
  );
}