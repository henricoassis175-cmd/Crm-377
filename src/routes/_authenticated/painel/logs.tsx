import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { formatDateTime, maskPII } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Audit = Database["public"]["Tables"]["audit_logs"]["Row"];
type Evento = Database["public"]["Tables"]["integration_events"]["Row"];
type Inbox = Database["public"]["Tables"]["webhook_inbox"]["Row"];

export const Route = createFileRoute("/_authenticated/painel/logs")({
  head: () => ({
    meta: [
      { title: "Logs e auditoria | CRM 377" },
      {
        name: "description",
        content:
          "Auditoria de ações, eventos de integração e recebimento de webhooks com PII mascarada.",
      },
      { property: "og:title", content: "Logs e auditoria | CRM 377" },
      {
        property: "og:description",
        content: "Rastreabilidade completa das operações do agente comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { storeId } = useStores();
  const [busca, setBusca] = useState("");

  const auditoria = useQuery({
    queryKey: ["audit", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Audit[];
    },
  });

  const eventos = useQuery({
    queryKey: ["integration-events", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Evento[];
    },
  });

  const inbox = useQuery({
    queryKey: ["webhook-inbox", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_inbox")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Inbox[];
    },
  });

  const filtro = (s: string) => !busca || s.toLowerCase().includes(busca.toLowerCase());

  return (
    <AppShell
      title="Logs e auditoria"
      description="Dados pessoais são mascarados na exibição. Segredos nunca são registrados."
      actions={
        <Input
          className="w-[220px]"
          placeholder="Filtrar"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      }
    >
      <Tabs defaultValue="auditoria">
        <TabsList>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          <TabsTrigger value="eventos">Eventos de integração</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks recebidos</TabsTrigger>
        </TabsList>

        <TabsContent value="auditoria" className="mt-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Ações no painel</CardTitle>
            </CardHeader>
            <CardContent>
              {auditoria.isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              ) : !auditoria.data?.length ? (
                <p className="text-sm text-muted-foreground">
                  Sem registros de auditoria (visível apenas para administradores).
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditoria.data
                      .filter((a) => filtro(a.action))
                      .map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(a.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{a.action}</TableCell>
                          <TableCell className="text-xs">{a.entity ?? "—"}</TableCell>
                          <TableCell className="max-w-[320px] truncate font-mono text-[11px] text-muted-foreground">
                            {maskPII(JSON.stringify(a.metadata))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventos" className="mt-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Chamadas de integração</CardTitle>
            </CardHeader>
            <CardContent>
              {!eventos.data?.length ? (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Latência</TableHead>
                      <TableHead>Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventos.data
                      .filter((e) => filtro(`${e.kind} ${e.event_type}`))
                      .map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(e.created_at)}
                          </TableCell>
                          <TableCell className="uppercase text-xs">{e.kind}</TableCell>
                          <TableCell className="text-xs">{e.event_type}</TableCell>
                          <TableCell className="text-xs">
                            {e.latency_ms ? `${e.latency_ms} ms` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={e.success ? "default" : "destructive"}>
                              {e.success ? "Sucesso" : "Falha"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Idempotência de webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              {!inbox.data?.length ? (
                <p className="text-sm text-muted-foreground">Nenhum webhook recebido ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>event_id</TableHead>
                      <TableHead>Processado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inbox.data
                      .filter((w) => filtro(`${w.source} ${w.event_id}`))
                      .map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(w.created_at)}
                          </TableCell>
                          <TableCell className="text-xs">{w.source}</TableCell>
                          <TableCell className="font-mono text-[11px]">{w.event_id}</TableCell>
                          <TableCell>
                            <Badge variant={w.processed ? "default" : "outline"}>
                              {w.processed ? "Sim" : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}