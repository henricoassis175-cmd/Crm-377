import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CRM 377 — Central do agente comercial de IA" },
      { name: "description", content: "Leads, conversas, handoffs e o Agente 377 em uma central multi-loja." },
      { property: "og:title", content: "CRM 377 — Central do agente comercial de IA" },
      { property: "og:description", content: "Leads, conversas, handoffs e o Agente 377 em uma central multi-loja." },
    ],
  }),
  component: Home,
});

const CAPS = [
  ["Multi-loja", "Cada operação isolada por loja, com acesso controlado por papel."],
  ["Kommo + n8n", "Leads, WhatsApp e Instagram orquestrados com contrato validado."],
  ["Handoff humano", "O agente sabe quando parar e passar para o vendedor certo."],
  ["Auditoria", "Toda ação administrativa registrada, com versionamento de prompts."],
] as const;

function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Logo />
        <Button asChild size="sm" variant="outline">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-28">
        <p className="text-xs font-medium tracking-wider text-primary uppercase">Vexa · Agente 377</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
          A central de comando do seu agente comercial.
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Controle leads, conversas, temperatura, estágio de funil e transferências humanas de todas as lojas em um só
          lugar — com segurança por loja e trilha de auditoria completa.
        </p>
        <div className="mt-8 flex gap-2">
          <Button asChild>
            <Link to="/painel">
              Abrir painel <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/auth">Fazer login</Link>
          </Button>
        </div>
        <div className="mt-20 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {CAPS.map(([t, d]) => (
            <div key={t} className="bg-card p-5">
              <p className="text-[13px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="mx-auto max-w-6xl border-t px-5 py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vexa · CRM 377
      </footer>
    </div>
  );
}