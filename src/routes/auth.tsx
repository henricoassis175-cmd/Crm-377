import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/app-shell";
import { NotConnectedState } from "@/components/data-state";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — CRM 377" },
      { name: "description", content: "Acesso restrito à equipe do CRM 377." },
      { property: "og:title", content: "Entrar — CRM 377" },
      { property: "og:description", content: "Acesso restrito à equipe do CRM 377." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(128),
});
type FormValues = z.infer<typeof schema>;

function AuthPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!supabase) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        toast.error("Não foi possível entrar", { description: "Verifique e-mail e senha." });
        return;
      }
      await logAudit({ action: "login", entity: "auth" });
      void navigate({ to: "/painel", replace: true });
    } catch (e) {
      console.error("[auth]", e);
      toast.error("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#efeee9] p-3 md:p-5">
      <div className="grid min-h-[calc(100vh-24px)] overflow-hidden rounded-[14px] bg-[#fbfbf9] shadow-ring-xs md:min-h-[calc(100vh-40px)] lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden border-r border-border/70 p-8 lg:flex lg:flex-col">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="Voltar ao início"><Logo /></Link>
            <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">Acesso restrito</span>
          </div>

          <div className="my-auto max-w-xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">CRM 377</p>
            <h1 className="mt-4 font-serif text-[56px] leading-[.98] tracking-[-0.045em]">
              Uma operação comercial precisa de contexto, não de ruído.
            </h1>
            <p className="mt-6 max-w-md text-[12.5px] leading-6 text-muted-foreground">
              Leads, conversas, handoffs, integrações e governança do agente organizados como uma única superfície operacional.
            </p>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-[9px] bg-white shadow-ring-xs">
            {[
              ["Multi-loja", "Escopo"],
              ["RBAC", "Acesso"],
              ["Auditável", "Governança"],
            ].map(([value, label]) => (
              <div key={value} className="border-r border-border/70 p-4 last:border-r-0">
                <p className="font-serif text-[18px] tracking-[-0.03em]">{value}</p>
                <p className="mt-1 text-[8.5px] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-8">
          <div className="w-full max-w-[380px]">
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <Link to="/"><Logo /></Link>
              <Button asChild size="sm" variant="ghost">
                <Link to="/"><ArrowLeft className="size-3" /> Início</Link>
              </Button>
            </div>

            <p className="text-[9.5px] font-medium uppercase tracking-[0.11em] text-muted-foreground">Workspace Vexa</p>
            <h2 className="mt-2 font-serif text-[38px] leading-none tracking-[-0.04em]">Entrar</h2>
            <p className="mt-2 text-[11.5px] leading-5 text-muted-foreground">
              Acesso da equipe e das lojas autorizadas.
            </p>

            <div className="mt-7 rounded-[10px] bg-white p-5 shadow-ring-sm">
              {!supabase ? (
                <div>
                  <NotConnectedState className="py-4" />
                  <Button asChild variant="outline" className="mt-2 w-full">
                    <Link to="/painel">Ver painel sem dados</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[10.5px]">E-mail</Label>
                    <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                      <p className="text-[10px] text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[10.5px]">Senha</Label>
                    <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
                    {form.formState.errors.password && (
                      <p className="text-[10px] text-destructive">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="size-3.5 animate-spin" />} Entrar
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
