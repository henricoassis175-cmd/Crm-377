import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatDateTime } from "@/lib/format";

type Uso = {
  id: string;
  store_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number | null;
  status: string;
  error_code: string | null;
  source: string;
  created_at: string;
};

const periodos = [
  { label: "7 dias", dias: 7 },
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
];

export const Route = createFileRoute("/_authenticated/painel/consumo-ia")({
  head: () => ({
    meta: [
      { title: "Consumo de IA | CRM 377" },
      {
        name: "description",
        content:
          "Acompanhe o consumo da Anthropic (Claude) por loja, período e modelo: tokens, erros e latência.",
      },
      { property: "og:title", content: "Consumo de IA | CRM 377" },
      {
        property: "og:description",
        content: "Tokens, erros e latência do Agente de IA Vexa - Claude por loja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsumoPage,
});

function ConsumoPage() {
  const { storeId, stores } = useStores();
  const [dias, setDias] = useState(30);

  const desde = useMemo(
    () => new Date(Date.now() - dias * 86400000).toISOString(),
    [dias],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["ai-usage", storeId, dias],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .eq("store_id", storeId!)
        .gte("created_at", desde)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Uso[];
    },
  });

  const linhas = data ?? [];
  const totalIn = linhas.reduce((a, l) => a + l.input_tokens, 0);
  const totalOut = linhas.reduce((a, l) => a + l.output_tokens, 0);
  const erros = linhas.filter((l) => l.status !== "ok").length;
  const latencias = linhas.map((l) => l.latency_ms ?? 0).filter(Boolean);
  const latenciaMedia = latencias.length
    ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
    : 0;

  const porModelo = useMemo(() => {
    const m = new Map<string, { chamadas: number; entrada: number; saida: number }>();
    for (const l of linhas) {
      const atual = m.get(l.model) ?? { chamadas: 0, entrada: 0, saida: 0 };
      atual.chamadas += 1;
      atual.entrada += l.input_tokens;
      atual.saida += l.output_tokens;
      m.set(l.model, atual);
    }
    return [...m.entries()];
  }, [linhas]);

  const loja = stores.find((s) => s.id === storeId);

  const cards = [
    { titulo: "Chamadas", valor: linhas.length },
    { titulo: "Tokens de entrada", valor: totalIn.toLocaleString("pt-BR") },
    { titulo: "Tokens de saída", valor: totalOut.toLocaleString("pt-BR") },
    { titulo: "Erros", valor: erros },
    { titulo: "Latência média", valor: `${latenciaMedia} ms` },
  ];

  return (
    <AppShell
      title="Consumo de IA"
      description="Uso da Anthropic separado por loja. A chave é central da Vexa; o consumo é sempre atribuído ao store_id."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {periodos.map((p) => (
          <Button
            key={p.dias}
            size="sm"
            variant={dias === p.dias ? "default" : "outline"}
            onClick={() => setDias(p.dias)}
          >
            {p.label}
          </Button>
        ))}
        {loja ? <Badge variant="outline">{loja.store_name}</Badge> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.titulo} className="border-border bg-surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{c.valor}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Por modelo</CardTitle>
        </CardHeader>
        <CardContent>
          {porModelo.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma chamada registrada neste período.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Chamadas</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {porModelo.map(([modelo, v]) => (
                  <TableRow key={modelo}>
                    <TableCell className="font-medium">{modelo}</TableCell>
                    <TableCell>{v.chamadas}</TableCell>
                    <TableCell>{v.entrada.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{v.saida.toLocaleString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Chamadas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : linhas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem consumo registrado. Assim que o n8n ou o laboratório chamarem a Claude, os
              registros aparecem aqui.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Latência</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.slice(0, 100).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDateTime(l.created_at)}
                      </TableCell>
                      <TableCell className="text-xs">{l.model}</TableCell>
                      <TableCell className="text-xs">{l.source}</TableCell>
                      <TableCell className="text-xs">{l.input_tokens}</TableCell>
                      <TableCell className="text-xs">{l.output_tokens}</TableCell>
                      <TableCell className="text-xs">{l.latency_ms ?? "—"} ms</TableCell>
                      <TableCell>
                        <Badge variant={l.status === "ok" ? "default" : "destructive"}>
                          {l.status === "ok" ? "OK" : (l.error_code ?? "erro")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}