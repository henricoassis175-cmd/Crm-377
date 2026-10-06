import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Database, Workflow, MessagesSquare, Sparkles, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useStores } from "@/lib/store-context";
import { formatDateTime } from "@/lib/format";
import { testarIntegracao } from "@/lib/agente.functions";
import type { Database as DB } from "@/integrations/supabase/types";

type Kind = DB["public"]["Enums"]["integration_kind"];
type Setting = DB["public"]["Tables"]["integration_settings"]["Row"];

const meta: Record<
  Kind,
  { titulo: string; icon: typeof Database; descricao: string; checklist: string[] }
> = {
  supabase: {
    titulo: "Banco de dados",
    icon: Database,
    descricao: "Persistência de lojas, catálogo, conversas e auditoria com RLS por loja.",
    checklist: ["Tabelas criadas", "RLS ativa", "Papéis atribuídos aos usuários"],
  },
  n8n: {
    titulo: "n8n",
    icon: Workflow,
    descricao:
      "Orquestrador do fluxo: recebe o widget_request, monta o contexto e responde ao Kommo.",
    checklist: [
      "Webhook de produção publicado",
      "Resposta 200 em até 2s",
      "Credencial de banco configurada no n8n",
    ],
  },
  kommo: {
    titulo: "Kommo",
    icon: MessagesSquare,
    descricao: "Canal de WhatsApp e Instagram, Salesbot e pipeline comercial.",
    checklist: [
      "Salesbot chamando o webhook",
      "Pipeline e etapa de atendimento humano definidos",
      "Usuário responsável padrão",
    ],
  },
  anthropic: {
    titulo: "Anthropic (Claude)",
    icon: Sparkles,
    descricao:
      "Cérebro do Agente de IA Vexa. A chave vive apenas nos segredos do backend, nunca no navegador.",
    checklist: [
      "ANTHROPIC_API_KEY nos segredos do backend",
      "Modelo configurado na loja (padrão claude-sonnet-4-5)",
      "Prompt e conhecimento publicados",
      "Respostas validadas pela Messages API",
    ],
  },
};

const statusLabel: Record<DB["public"]["Enums"]["integration_status"], string> = {
  nao_configurado: "Não configurado",
  configurado: "Configurado",
  testado: "Testado",
};

export const Route = createFileRoute("/_authenticated/painel/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações | CRM 377" },
      {
        name: "description",
        content: "Status honesto das integrações de banco, n8n, Kommo e Claude.",
      },
      { property: "og:title", content: "Integrações | CRM 377" },
      {
        property: "og:description",
        content: "Checklist e testes das integrações do agente comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntegracoesPage,
});

function IntegracoesPage() {
  const { storeId } = useStores();
  const qc = useQueryClient();
  const testar = useServerFn(testarIntegracao);
  const [webhook, setWebhook] = useState("");

  const { data } = useQuery({
    queryKey: ["integrations", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_settings")
        .select("*")
        .eq("store_id", storeId!);
      if (error) throw error;
      return data as Setting[];
    },
  });

  const salvarWebhook = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Selecione uma loja.");
      if (webhook && !webhook.startsWith("https://")) throw new Error("A URL precisa usar HTTPS.");
      const { error } = await supabase
        .from("integration_settings")
        .update({
          config: { webhook_url: webhook },
          status: webhook ? "configurado" : "nao_configurado",
        })
        .eq("store_id", storeId)
        .eq("kind", "n8n");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configuração salva.");
      void qc.invalidateQueries({ queryKey: ["integrations", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rodarTeste = useMutation({
    mutationFn: async (kind: Kind) => testar({ data: { storeId: storeId!, kind } }),
    onSuccess: (r) => {
      if (r.sucesso) toast.success(r.detalhe);
      else toast.error(r.detalhe);
      void qc.invalidateQueries({ queryKey: ["integrations", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      title="Integrações"
      description="Nenhum status é marcado como conectado sem um teste real executado aqui."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {(Object.keys(meta) as Kind[]).map((kind) => {
          const cfg = data?.find((d) => d.kind === kind);
          const Icon = meta[kind].icon;
          return (
            <Card key={kind} className="border-border bg-surface">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base">{meta[kind].titulo}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{meta[kind].descricao}</p>
                  </div>
                </div>
                <Badge variant={cfg?.status === "testado" ? "default" : "outline"}>
                  {statusLabel[cfg?.status ?? "nao_configurado"]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {meta[kind].checklist.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>

                {kind === "n8n" ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs">URL do webhook (não sensível)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={
                          webhook ||
                          ((cfg?.config as { webhook_url?: string } | null)?.webhook_url ?? "")
                        }
                        onChange={(e) => setWebhook(e.target.value)}
                        placeholder="https://…/webhook/crm377"
                      />
                      <Button variant="outline" onClick={() => salvarWebhook.mutate()}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-muted-foreground">
                    {cfg?.last_tested_at
                      ? `Último teste: ${formatDateTime(cfg.last_tested_at)} — ${cfg.last_test_result}`
                      : "Nunca testado."}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!storeId || rodarTeste.isPending}
                    onClick={() => rodarTeste.mutate(kind)}
                  >
                    <PlayCircle className="size-4" /> Testar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Tokens, chaves e senhas ficam apenas nos segredos do backend e no n8n. Este painel nunca
        exibe nem armazena credenciais.
      </p>
    </AppShell>
  );
}