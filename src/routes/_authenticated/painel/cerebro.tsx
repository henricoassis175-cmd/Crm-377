import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { History, Save, Rocket, Undo2, Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useStores } from "@/lib/store-context";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { formatDateTime } from "@/lib/format";
import { registrarAuditoria } from "@/lib/audit";
import type { Database } from "@/integrations/supabase/types";

type Versao = Database["public"]["Tables"]["prompt_versions"]["Row"];
type Tabela = "prompt_versions" | "knowledge_versions";

export const Route = createFileRoute("/_authenticated/painel/cerebro")({
  head: () => ({
    meta: [
      { title: "Cérebro do agente | CRM 377" },
      {
        name: "description",
        content: "Prompt e base de conhecimento versionados, com rascunho, publicação e rollback.",
      },
      { property: "og:title", content: "Cérebro do agente | CRM 377" },
      {
        property: "og:description",
        content: "Controle versionado do comportamento do agente comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CerebroPage,
});

function CerebroPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useProfile(user?.id);

  return (
    <AppShell
      title="Cérebro do agente"
      description="Prompt (seção 6) e conhecimento (seção 6.2) versionados de forma independente."
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Verificando permissões…</p>
      ) : !isAdmin ? (
        <Card className="border-border bg-surface">
          <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
            <Lock className="size-5" /> Área restrita a administradores.
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="prompt">
          <TabsList>
            <TabsTrigger value="prompt">Prompt do sistema</TabsTrigger>
            <TabsTrigger value="conhecimento">Base de conhecimento</TabsTrigger>
          </TabsList>
          <TabsContent value="prompt" className="mt-4">
            <Editor tabela="prompt_versions" rotulo="Prompt do sistema (seção 6)" />
          </TabsContent>
          <TabsContent value="conhecimento" className="mt-4">
            <Editor tabela="knowledge_versions" rotulo="Base de conhecimento (seção 6.2)" />
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}

function Editor({ tabela, rotulo }: { tabela: Tabela; rotulo: string }) {
  const { storeId } = useStores();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [notas, setNotas] = useState("");

  const { data: versoes, isLoading } = useQuery({
    queryKey: [tabela, storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tabela)
        .select("*")
        .eq("store_id", storeId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return data as Versao[];
    },
  });

  const publicada = versoes?.find((v) => v.status === "publicado") ?? null;
  const rascunho = versoes?.find((v) => v.status === "rascunho") ?? null;

  useEffect(() => {
    const base = rascunho ?? publicada;
    setTitulo(base?.title ?? rotulo);
    setConteudo(base?.content ?? "");
    setNotas(base?.notes ?? "");
  }, [rascunho?.id, publicada?.id, rotulo]);

  const proximaVersao = (versoes?.[0]?.version ?? 0) + 1;

  const salvarRascunho = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Selecione uma loja.");
      if (rascunho) {
        const { error } = await supabase
          .from(tabela)
          .update({ title: titulo, content: conteudo, notes: notas || null })
          .eq("id", rascunho.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tabela).insert({
          store_id: storeId,
          title: titulo,
          content: conteudo,
          notes: notas || null,
          status: "rascunho",
          version: proximaVersao,
          created_by: user?.id ?? null,
        });
        if (error) throw error;
      }
      await registrarAuditoria({ action: `${tabela}.draft_save`, entity: tabela, storeId });
    },
    onSuccess: () => {
      toast.success("Rascunho salvo.");
      void qc.invalidateQueries({ queryKey: [tabela, storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publicar = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Selecione uma loja.");
      await salvarRascunho.mutateAsync();
      const { data: atual } = await supabase
        .from(tabela)
        .select("id")
        .eq("store_id", storeId)
        .eq("status", "rascunho")
        .maybeSingle();
      if (publicada) {
        const { error } = await supabase
          .from(tabela)
          .update({ status: "arquivado" })
          .eq("id", publicada.id);
        if (error) throw error;
      }
      if (atual) {
        const { error } = await supabase
          .from(tabela)
          .update({ status: "publicado", published_at: new Date().toISOString() })
          .eq("id", atual.id);
        if (error) throw error;
      }
      await registrarAuditoria({ action: `${tabela}.publish`, entity: tabela, storeId });
    },
    onSuccess: () => {
      toast.success("Versão publicada.");
      void qc.invalidateQueries({ queryKey: [tabela, storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rollback = useMutation({
    mutationFn: async (v: Versao) => {
      if (publicada) {
        const { error } = await supabase
          .from(tabela)
          .update({ status: "arquivado" })
          .eq("id", publicada.id);
        if (error) throw error;
      }
      const { error } = await supabase
        .from(tabela)
        .update({ status: "publicado", published_at: new Date().toISOString() })
        .eq("id", v.id);
      if (error) throw error;
      await registrarAuditoria({
        action: `${tabela}.rollback`,
        entity: tabela,
        entityId: v.id,
        storeId,
      });
    },
    onSuccess: () => {
      toast.success("Rollback aplicado.");
      void qc.invalidateQueries({ queryKey: [tabela, storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card className="border-border bg-surface">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{rotulo}</CardTitle>
          <Badge variant="outline">
            {publicada ? `Publicada v${publicada.version}` : "Sem versão publicada"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <Textarea
              rows={18}
              className="font-mono text-xs"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notas da versão</Label>
            <Input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="O que mudou nesta versão"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => salvarRascunho.mutate()}
              disabled={!storeId || salvarRascunho.isPending}
            >
              <Save className="size-4" /> Salvar rascunho
            </Button>
            <Button onClick={() => publicar.mutate()} disabled={!storeId || publicar.isPending}>
              <Rocket className="size-4" /> Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-surface">
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="size-4 text-primary" />
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : !versoes?.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma versão salva ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {versoes.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>v{v.version}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === "publicado" ? "default" : "outline"}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(v.published_at ?? v.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {v.status === "arquivado" ? (
                        <Button size="sm" variant="ghost" onClick={() => rollback.mutate(v)}>
                          <Undo2 className="size-4" /> Restaurar
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}