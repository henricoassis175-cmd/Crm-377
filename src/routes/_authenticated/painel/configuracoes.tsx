import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, useProfile, roleLabels } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/painel/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | CRM 377 - Agente Comercial" },
      {
        name: "description",
        content: "Dados do usuário, papéis de acesso e preferências do CRM 377.",
      },
      { property: "og:title", content: "Configurações | CRM 377" },
      { property: "og:description", content: "Perfil, papéis e preferências da conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { user } = useAuth();
  const { profile, roles, loading } = useProfile(user?.id);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setJobTitle(profile.job_title ?? "");
  }, [profile]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, job_title: jobTitle })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar", { description: error.message });
      return;
    }
    toast.success("Perfil atualizado");
  }

  return (
    <AppShell title="Configurações" description="Dados da conta e nível de acesso.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader>
            <CardTitle>Meu perfil</CardTitle>
            <CardDescription>Informações exibidas para a equipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={salvar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Cargo</Label>
                  <Input
                    id="job_title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Consultor comercial"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={user?.email ?? ""} readOnly disabled />
              </div>
              <Button type="submit" disabled={saving || loading}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Acesso</CardTitle>
            <CardDescription>Papéis atribuídos à sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {roles.length ? (
                roles.map((r) => <Badge key={r}>{roleLabels[r]}</Badge>)
              ) : (
                <Badge variant="secondary">Sem papel atribuído</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Papéis são gerenciados por administradores e controlam o que cada pessoa pode ver e
              alterar no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}