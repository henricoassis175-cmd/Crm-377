import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile, roleLabels, type AppRole } from "@/hooks/use-auth";
import { useStores } from "@/lib/store-context";
import { registrarAuditoria } from "@/lib/audit";
import { maskPII } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários | CRM 377" },
      {
        name: "description",
        content: "Papéis de acesso e lojas atribuídas a cada usuário do painel.",
      },
      { property: "og:title", content: "Usuários | CRM 377" },
      {
        property: "og:description",
        content: "Gestão de papéis admin, gestor e operador por loja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsuariosPage,
});

interface Linha {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: AppRole[];
  stores: string[];
}

function UsuariosPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useProfile(user?.id);
  const { stores } = useStores();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }, { data: members }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").order("full_name"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("store_members").select("user_id, store_id"),
      ]);
      return (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
        stores: (members ?? []).filter((m) => m.user_id === p.id).map((m) => m.store_id),
      })) as Linha[];
    },
  });

  const definirPapel = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delErr) throw delErr;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
      await registrarAuditoria({
        action: "user.set_role",
        entity: "user_roles",
        entityId: userId,
        metadata: { role },
      });
    },
    onSuccess: () => {
      toast.success("Papel atualizado.");
      void qc.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternarLoja = useMutation({
    mutationFn: async ({
      userId,
      storeId,
      ativo,
    }: {
      userId: string;
      storeId: string;
      ativo: boolean;
    }) => {
      if (ativo) {
        const { error } = await supabase
          .from("store_members")
          .insert({ user_id: userId, store_id: storeId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("store_members")
          .delete()
          .eq("user_id", userId)
          .eq("store_id", storeId);
        if (error) throw error;
      }
      await registrarAuditoria({
        action: "user.store_access",
        entity: "store_members",
        entityId: userId,
        storeId,
        metadata: { ativo },
      });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["usuarios"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading)
    return (
      <AppShell title="Usuários">
        <p className="text-sm text-muted-foreground">Verificando permissões…</p>
      </AppShell>
    );
  if (!isAdmin)
    return (
      <AppShell title="Usuários">
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
            <Lock className="size-5" /> Área restrita a administradores.
          </CardContent>
        </Card>
      </AppShell>
    );

  return (
    <AppShell
      title="Usuários"
      description="Papéis e lojas atribuídas. Novos usuários entram como operador ao se cadastrar."
    >
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Lojas atribuídas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.full_name ?? "Sem nome"}</p>
                      <p className="text-[11px] text-muted-foreground">{maskPII(u.email)}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.roles[0] ?? "operador"}
                        onValueChange={(v) =>
                          definirPapel.mutate({ userId: u.id, role: v as AppRole })
                        }
                      >
                        <SelectTrigger className="h-8 w-[170px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(roleLabels) as AppRole[]).map((r) => (
                            <SelectItem key={r} value={r}>
                              {roleLabels[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {u.roles.includes("admin") ? (
                        <Badge variant="outline">Acesso global</Badge>
                      ) : stores.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Nenhuma loja cadastrada
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {stores.map((s) => (
                            <label key={s.id} className="flex items-center gap-1.5 text-xs">
                              <Checkbox
                                checked={u.stores.includes(s.id)}
                                onCheckedChange={(v) =>
                                  alternarLoja.mutate({
                                    userId: u.id,
                                    storeId: s.id,
                                    ativo: v === true,
                                  })
                                }
                              />
                              {s.store_name}
                            </label>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Convites de novos usuários acontecem pela tela de cadastro. Não existem usuários ou
            senhas fixas no código.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => void qc.invalidateQueries({ queryKey: ["usuarios"] })}
          >
            Atualizar lista
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}