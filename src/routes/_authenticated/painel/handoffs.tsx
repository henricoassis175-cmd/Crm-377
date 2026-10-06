import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { formatDateTime } from "@/lib/format";
import { rotuloMotivo } from "@/lib/agent-contract";
import { registrarAuditoria } from "@/lib/audit";
import type { Database } from "@/integrations/supabase/types";

type Handoff = Database["public"]["Tables"]["handoffs"]["Row"];
type Status = Database["public"]["Enums"]["handoff_status"];

const statusLabel: Record<Status, string> = {
  pendente: "Pendente",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const Route = createFileRoute("/_authenticated/painel/handoffs")({
  head: () => ({
    meta: [
      { title: "Handoffs | CRM 377 - Agente Comercial" },
      {
        name: "description",
        content: "Fila de transferências para atendimento humano com motivo, destino e auditoria.",
      },
      { property: "og:title", content: "Handoffs | CRM 377" },
      {
        property: "og:description",
        content: "Fila de transferências do agente para o time comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HandoffsPage,
});

function HandoffsPage() {
  const { storeId, store } = useStores();
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<string>("todos");

  const { data, isLoading } = useQuery({
    queryKey: ["handoffs", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handoffs")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Handoff[];
    },
  });

  const lista = (data ?? []).filter((h) => filtro === "todos" || h.status === filtro);

  const mudarStatus = useMutation({
    mutationFn: async ({ h, status }: { h: Handoff; status: Status }) => {
      const { error } = await supabase
        .from("handoffs")
        .update({
          status,
          resolved_at:
            status === "concluido" || status === "cancelado" ? new Date().toISOString() : null,
        })
        .eq("id", h.id);
      if (error) throw error;
      await registrarAuditoria({
        action: "handoff.status",
        entity: "handoffs",
        entityId: h.id,
        storeId,
        metadata: { status },
      });
    },
    onSuccess: () => {
      toast.success("Handoff atualizado.");
      void qc.invalidateQueries({ queryKey: ["handoffs", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const acoes = store
    ? ([
        ["Parar o bot", store.handoff_stop_bot],
        ["Atribuir vendedor", store.handoff_assign_user],
        ["Mover para Atendimento Humano", store.handoff_move_stage],
        ["Registrar nota", store.handoff_add_note],
      ] as const)
    : [];

  return (
    <AppShell
      title="Handoffs"
      description="Transferências para atendimento humano e ações aplicadas no Kommo."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="border-border bg-surface">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Fila</CardTitle>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(Object.keys(statusLabel) as Status[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
            ) : lista.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum handoff registrado. A fila é preenchida quando o agente decide encaminhar
                para humano.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criado</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações aplicadas</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(h.created_at)}
                      </TableCell>
                      <TableCell>{rotuloMotivo[h.reason] ?? h.reason}</TableCell>
                      <TableCell className="text-xs">{h.target ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={h.status === "pendente" ? "default" : "outline"}>
                          {statusLabel[h.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-mono text-[11px] text-muted-foreground">
                        {JSON.stringify(h.actions_applied)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={h.status}
                          onValueChange={(v) => mudarStatus.mutate({ h, status: v as Status })}
                        >
                          <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(statusLabel) as Status[]).map((s) => (
                              <SelectItem key={s} value={s}>
                                {statusLabel[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Ações configuradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {acoes.length === 0 ? (
              <p className="text-muted-foreground">Selecione uma loja.</p>
            ) : (
              acoes.map(([label, ativo]) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant={ativo ? "default" : "outline"}>
                    {ativo ? "Ligada" : "Desligada"}
                  </Badge>
                </div>
              ))
            )}
            <p className="pt-2 text-xs text-muted-foreground">
              Configure em Lojas → editar loja. As ações são executadas pelo n8n no Kommo.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}