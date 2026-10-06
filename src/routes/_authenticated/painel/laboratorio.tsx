import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FlaskConical, Play } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { useStores } from "@/lib/store-context";
import { executarTeste } from "@/lib/agente.functions";
import { formatDateTime } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Cenario = Database["public"]["Tables"]["test_scenarios"]["Row"];
type Execucao = Database["public"]["Tables"]["test_runs"]["Row"];

export const Route = createFileRoute("/_authenticated/painel/laboratorio")({
  head: () => ({
    meta: [
      { title: "Laboratório | CRM 377" },
      {
        name: "description",
        content:
          "Teste o agente com o contrato real: histórico, preço ligado ou desligado e esperado x obtido.",
      },
      { property: "og:title", content: "Laboratório | CRM 377" },
      {
        property: "og:description",
        content: "Validação dos cenários críticos do agente comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LaboratorioPage,
});

function LaboratorioPage() {
  const { storeId } = useStores();
  const qc = useQueryClient();
  const rodar = useServerFn(executarTeste);
  const [cenarioId, setCenarioId] = useState<string>("");
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState("");
  const [precoLigado, setPrecoLigado] = useState(true);

  const { data: cenarios } = useQuery({
    queryKey: ["test-scenarios", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("test_scenarios").select("*").order("code");
      if (error) throw error;
      return data as Cenario[];
    },
  });

  const { data: execucoes } = useQuery({
    queryKey: ["test-runs", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_runs")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as Execucao[];
    },
  });

  const cenario = cenarios?.find((c) => c.id === cenarioId) ?? null;

  function carregarCenario(id: string) {
    setCenarioId(id);
    const c = cenarios?.find((x) => x.id === id);
    if (!c) return;
    setMensagem(c.input_message);
    setPrecoLigado(c.price_enabled);
    const hist = (c.history as { role: string; content: string }[] | null) ?? [];
    setHistorico(hist.map((h) => `${h.role}: ${h.content}`).join("\n"));
  }

  const executar = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Selecione uma loja.");
      const hist = historico
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [papel, ...resto] = l.split(":");
          const role = papel?.trim().toLowerCase() === "agente" ? "agente" : "cliente";
          return { role: role as "cliente" | "agente", content: resto.join(":").trim() || l };
        })
        .slice(-15);
      return rodar({
        data: {
          storeId,
          message: mensagem,
          history: hist,
          priceEnabled: precoLigado,
          scenarioId: cenarioId || null,
          expected: (cenario?.expected as Record<string, unknown>) ?? {},
        },
      });
    },
    onSuccess: (r) => {
      if (!r.ok) toast.error(r.mensagem ?? "Falha na execução.");
      else if (r.erros.length) toast.warning("Executado com divergências.");
      else toast.success("Cenário passou.");
      void qc.invalidateQueries({ queryKey: ["test-runs", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resultado = executar.data;

  return (
    <AppShell
      title="Laboratório do Agente"
      description="Usa o contrato real do agente. Preço só sai do catálogo da loja selecionada."
      actions={
        <Badge variant="outline" className="border-warning/40 text-warning">
          Modo teste — nada é enviado ao Kommo
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border bg-surface">
          <CardHeader className="flex flex-row items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <CardTitle className="text-base">Execução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Cenário</Label>
              <Select value={cenarioId} onValueChange={carregarCenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolher cenário salvo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {(cenarios ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Histórico (uma linha por turno: "cliente: …" ou "agente: …")</Label>
              <Textarea rows={5} value={historico} onChange={(e) => setHistorico(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mensagem do cliente</Label>
              <Textarea rows={3} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label className="font-normal">Integração de preço ligada</Label>
              <Switch checked={precoLigado} onCheckedChange={setPrecoLigado} />
            </div>
            <Button
              onClick={() => executar.mutate()}
              disabled={!storeId || !mensagem.trim() || executar.isPending}
            >
              <Play className="size-4" /> {executar.isPending ? "Executando…" : "Executar"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Esperado x obtido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!resultado ? (
              <p className="text-muted-foreground">Execute um cenário para ver o resultado.</p>
            ) : (
              <>
                <Badge
                  variant={resultado.ok && resultado.erros.length === 0 ? "default" : "destructive"}
                >
                  {resultado.ok
                    ? resultado.erros.length === 0
                      ? "Passou"
                      : "Falhou"
                    : "Não executado"}
                </Badge>
                {resultado.mensagem ? (
                  <p className="text-destructive">{resultado.mensagem}</p>
                ) : null}
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Resposta ao cliente</p>
                  <p className="whitespace-pre-wrap">{resultado.saida.resposta}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Info
                    label="Temperatura"
                    valor={resultado.saida.temperatura_lead}
                    esperado={cenario?.expected}
                    campo="temperatura_lead"
                  />
                  <Info
                    label="Estágio"
                    valor={resultado.saida.estagio}
                    esperado={cenario?.expected}
                    campo="estagio"
                  />
                  <Info
                    label="Ação"
                    valor={resultado.saida.acao}
                    esperado={cenario?.expected}
                    campo="acao"
                  />
                  <Info
                    label="Motivo handoff"
                    valor={resultado.saida.motivo_handoff ?? "—"}
                    esperado={cenario?.expected}
                    campo="motivo_handoff"
                  />
                </div>
                {resultado.erros.length ? (
                  <ul className="space-y-1 text-xs text-destructive">
                    {resultado.erros.map((e) => (
                      <li key={e}>• {e}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Latência: {resultado.latencia_ms} ms
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Histórico de execuções</CardTitle>
          </CardHeader>
          <CardContent>
            {!execucoes?.length ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma execução registrada para esta loja.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Latência</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {execucoes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(r.created_at)}
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate text-xs">
                        {r.input_message}
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.price_enabled ? "ligado" : "desligado"}
                      </TableCell>
                      <TableCell className="text-xs">{r.latency_ms ?? "—"} ms</TableCell>
                      <TableCell>
                        <Badge variant={r.passed ? "default" : "destructive"}>
                          {r.passed ? "Passou" : "Falhou"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Info({
  label,
  valor,
  esperado,
  campo,
}: {
  label: string;
  valor: string;
  esperado: unknown;
  campo: string;
}) {
  const exp = (esperado as Record<string, unknown> | undefined)?.[campo];
  const divergente = exp !== undefined && exp !== null && exp !== valor;
  return (
    <div
      className={`rounded-lg border p-2 ${divergente ? "border-destructive/50" : "border-border"}`}
    >
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{valor}</p>
      {exp !== undefined && exp !== null ? (
        <p className="text-[11px] text-muted-foreground">esperado: {String(exp)}</p>
      ) : null}
    </div>
  );
}