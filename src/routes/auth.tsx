import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

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
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="mb-8 inline-flex">
          <Logo />
        </Link>
        <h1 className="font-serif text-4xl tracking-tight">Entrar</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">Acesso restrito à equipe Vexa e às lojas parceiras.</p>
        <div className="mt-6 rounded-lg border bg-card p-5 shadow-xs">
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
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" autoComplete="email" className="h-10" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" autoComplete="current-password" className="h-10" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="h-9 w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />} Entrar
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}