import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
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
import { formatDateTime, maskName, maskPII } from "@/lib/format";
import {
  rotuloEstagio,
  rotuloTemperatura,
  type Estagio,
  type Temperatura,
} from "@/lib/agent-contract";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"] & {
  contacts: { name: string | null; phone: string | null; instagram: string | null } | null;
};
type Mensagem = Database["public"]["Tables"]["messages"]["Row"];

export const Route = createFileRoute("/_authenticated/painel/leads")({
  head: () => ({
    meta: [
      { title: "Leads e conversas | CRM 377" },
      {
        name: "description",
        content:
          "Leads reais do agente comercial com temperatura, estágio e histórico cronológico.",
      },
      { property: "og:title", content: "Leads e conversas | CRM 377" },
      {
        property: "og:description",
        content: "Acompanhe conversas do agente com temperatura e estágio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { storeId } = useStores();
  const [busca, setBusca] = useState("");
  const [temp, setTemp] = useState("todas");
  const [estagio, setEstagio] = useState("todos");
  const [selecionado, setSelecionado] = useState<Lead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, contacts(name, phone, instagram)")
        .eq("store_id", storeId!)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return data as unknown as Lead[];
    },
  });

  const leads = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (data ?? []).filter((l) => {
      if (temp !== "todas" && l.temperature !== temp) return false;
      if (estagio !== "todos" && l.stage !== estagio) return false;
      if (t && !`${l.contacts?.name ?? ""} ${l.kommo_lead_id}`.toLowerCase().includes(t))
        return false;
      return true;
    });
  }, [data, busca, temp, estagio]);

  const { data: mensagens } = useQuery({
    queryKey: ["lead-messages", selecionado?.id],
    enabled: !!selecionado,
    queryFn: async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("lead_id", selecionado!.id);
      const ids = (convs ?? []).map((c) => c.id);
      if (!ids.length) return [] as Mensagem[];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", ids)
        .order("created_at");
      if (error) throw error;
      return data as Mensagem[];
    },
  });

  return (
    <AppShell
      title="Leads e conversas"
      description="Dados reais gravados pelo fluxo n8n; nada é simulado aqui."
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border bg-surface">
          <CardHeader className="gap-3">
            <CardTitle className="text-base">Leads</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input
                className="min-w-[180px] flex-1"
                placeholder="Buscar por nome ou ID Kommo"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <Select value={temp} onValueChange={setTemp}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Temperatura</SelectItem>
                  {(Object.keys(rotuloTemperatura) as Temperatura[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {rotuloTemperatura[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={estagio} onValueChange={setEstagio}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Estágio</SelectItem>
                  {(Object.keys(rotuloEstagio) as Estagio[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {rotuloEstagio[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
            ) : leads.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum lead ainda. Eles aparecem quando o Kommo enviar conversas ao n8n.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contato</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Última msg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer"
                      onClick={() => setSelecionado(l)}
                    >
                      <TableCell>
                        <p className="font-medium">{maskName(l.contacts?.name)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Kommo #{l.kommo_lead_id}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rotuloTemperatura[l.temperature]}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{rotuloEstagio[l.stage]}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(l.last_message_at)}
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
            <CardTitle className="text-base">Conversa</CardTitle>
          </CardHeader>
          <CardContent>
            {!selecionado ? (
              <p className="text-sm text-muted-foreground">
                Selecione um lead para ver o histórico cronológico.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      {maskName(selecionado.contacts?.name)}
                    </strong>
                  </p>
                  <p>
                    {maskPII(selecionado.contacts?.phone ?? selecionado.contacts?.instagram ?? "")}
                  </p>
                  <p>
                    Estágio: {rotuloEstagio[selecionado.stage]} · Temperatura:{" "}
                    {rotuloTemperatura[selecionado.temperature]}
                  </p>
                </div>
                {!mensagens?.length ? (
                  <p className="text-sm text-muted-foreground">
                    Sem mensagens registradas para este lead.
                  </p>
                ) : (
                  <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                    {mensagens.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-lg border p-2.5 text-sm ${m.role === "agente" ? "border-primary/30 bg-primary/5" : "border-border"}`}
                      >
                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="capitalize">{m.role}</span>
                          <span>
                            {formatDateTime(m.created_at)}
                            {m.latency_ms ? ` · ${m.latency_ms}ms` : ""}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}