import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CircleDot, MessagesSquare, Workflow } from "lucide-react";
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

const CAPABILITIES = [
  ["Multi-loja", "Operações isoladas por loja, com acesso controlado por papel."],
  ["Kommo + n8n", "Leads e canais conectados a uma esteira operacional rastreável."],
  ["Handoff humano", "Transferência de contexto quando a conversa precisa de uma pessoa."],
  ["Auditoria", "Versões, eventos e ações administrativas registrados no sistema."],
] as const;

function ProductFrame() {
  return (
    <div className="rounded-[14px] bg-[#e8e7e2] p-2 shadow-ring-lg">
      <div className="overflow-hidden rounded-[10px] bg-[#fbfbf9] shadow-ring-xs">
        <div className="flex h-10 items-center justify-between border-b border-border/70 px-3">
          <div className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-[5px] bg-[#232226] text-[8px] font-semibold text-white">377</span>
            <span className="text-[10px] font-medium">Visão geral</span>
          </div>
          <span className="rounded-[5px] bg-muted px-2 py-1 text-[8.5px] text-muted-foreground">Produto</span>
        </div>

        <div className="grid md:grid-cols-[150px_1fr]">
          <aside className="hidden border-r border-border/70 bg-[#f0efeb] p-2.5 md:block">
            <div className="mb-3 h-8 rounded-[7px] bg-white shadow-raised" />
            <div className="space-y-1">
              {["Visão geral", "Leads", "Handoffs", "Catálogo", "Integrações"].map((item, index) => (
                <div
                  key={item}
                  className={
                    "flex h-7 items-center gap-2 rounded-[6px] px-2 text-[8.5px] " +
                    (index === 0 ? "bg-white font-medium shadow-raised" : "text-muted-foreground")
                  }
                >
                  <span className="size-1.5 rounded-full bg-current opacity-50" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="p-4">
            <p className="text-[7.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Operação comercial
            </p>
            <h2 className="mt-1 font-serif text-[23px] leading-none tracking-[-0.04em]">Visão geral</h2>
            <p className="mt-2 max-w-sm text-[8.5px] leading-4 text-muted-foreground">
              Uma superfície operacional desenhada para leitura rápida, decisão e continuidade.
            </p>

            <div className="mt-4 grid overflow-hidden rounded-[8px] bg-white shadow-ring-xs sm:grid-cols-3">
              {[
                ["Leads ativos", "128"],
                ["Handoffs", "07"],
                ["Latência média", "1,2s"],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-border/70 p-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="text-[7.5px] uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
                  <p className="mt-4 font-mono text-[17px] font-medium tabular-nums tracking-[-0.04em]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_.65fr]">
              <div className="rounded-[8px] bg-white p-3 shadow-ring-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-medium">Pipeline comercial</span>
                  <span className="text-[7.5px] text-muted-foreground">Tempo real</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[72, 46, 28].map((width, index) => (
                    <div key={width}>
                      <div className="mb-1 flex items-center justify-between text-[7.5px] text-muted-foreground">
                        <span>{["Quente", "Morna", "Fria"][index]}</span>
                        <span className="font-mono">{["42", "31", "18"][index]}</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted">
                        <div className="h-1 rounded-full bg-foreground/75" style={{ width: width + "%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[8px] bg-white p-3 shadow-ring-xs">
                <div className="flex items-center gap-2">
                  <Workflow className="size-3 text-muted-foreground" />
                  <span className="text-[8.5px] font-medium">Integrações</span>
                </div>
                <div className="mt-3 space-y-2">
                  {["Supabase", "Kommo", "n8n"].map((name) => (
                    <div key={name} className="flex items-center justify-between text-[7.5px]">
                      <span>{name}</span>
                      <CircleDot className="size-2.5 text-success" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-[#f3f2ee]">
      <header className="mx-auto flex h-14 max-w-[1220px] items-center justify-between px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/painel">Abrir produto <ArrowUpRight className="size-3" /></Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1220px] px-5 pb-20 pt-10 md:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div className="pb-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">Vexa · Agente 377</p>
            <h1 className="mt-4 max-w-xl font-serif text-[46px] leading-[.98] tracking-[-0.045em] md:text-[66px]">
              Operação comercial com contexto, controle e continuidade.
            </h1>
            <p className="mt-6 max-w-lg text-[13px] leading-6 text-muted-foreground">
              CRM multi-loja para acompanhar leads, conversas, handoffs, integrações e a governança do agente comercial em uma única superfície.
            </p>

            <div className="mt-8 flex items-center gap-2">
              <Button asChild size="lg">
                <Link to="/painel">Abrir painel <ArrowUpRight className="size-3.5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">Acesso da equipe</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-2 text-[10px] text-muted-foreground">
              <MessagesSquare className="size-3.5" />
              <span>Leads, IA e atendimento humano no mesmo fluxo.</span>
            </div>
          </div>

          <ProductFrame />
        </div>

        <section className="mt-16 border-t border-border/70 pt-7">
          <p className="mb-5 text-[9.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Estrutura operacional
          </p>
          <div className="grid gap-px overflow-hidden rounded-[10px] bg-border/70 shadow-ring-xs sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map(([title, description], index) => (
              <article key={title} className="min-h-[148px] bg-[#fbfbf9] p-5">
                <span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span>
                <h2 className="mt-6 text-[12px] font-medium">{title}</h2>
                <p className="mt-2 text-[10.5px] leading-5 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[1220px] border-t border-border/70 px-5 py-6 text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} Vexa · CRM 377
      </footer>
    </div>
  );
}
