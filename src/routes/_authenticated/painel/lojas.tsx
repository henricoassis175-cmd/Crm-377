import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useStores, type Store } from "@/lib/store-context";
import { registrarAuditoria } from "@/lib/audit";
import { useAuth, useProfile } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/painel/lojas")({
  head: () => ({
    meta: [
      { title: "Lojas | CRM 377 - Agente Comercial" },
      {
        name: "description",
        content: "Cadastro e configuração das lojas atendidas pelo agente comercial.",
      },
      { property: "og:title", content: "Lojas | CRM 377" },
      {
        property: "og:description",
        content: "Cadastro e configuração multi-loja do agente comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LojasPage,
});

type FormState = {
  store_id: string;
  store_name: string;
  agent_name: string;
  reveal_virtual: boolean;
  about: string;
  price_source: "manual" | "api_externa";
  price_integration_enabled: boolean;
  kommo_subdomain: string;
  kommo_account_id: string;
  ai_model: string;
  agent_paused: boolean;
  kommo_pipeline_id: string;
  kommo_human_stage_id: string;
  default_responsible_user_id: string;
  handoff_target: string;
  handoff_stop_bot: boolean;
  handoff_assign_user: boolean;
  handoff_move_stage: boolean;
  handoff_add_note: boolean;
  active: boolean;
};

const vazio: FormState = {
  store_id: "",
  store_name: "",
  agent_name: "",
  reveal_virtual: false,
  about: "",
  price_source: "manual",
  price_integration_enabled: false,
  kommo_subdomain: "",
  kommo_account_id: "",
  ai_model: "claude-sonnet-4-5",
  agent_paused: false,
  kommo_pipeline_id: "",
  kommo_human_stage_id: "",
  default_responsible_user_id: "",
  handoff_target: "",
  handoff_stop_bot: true,
  handoff_assign_user: true,
  handoff_move_stage: true,
  handoff_add_note: true,
  active: false,
};

function fromStore(s: Store): FormState {
  return {
    store_id: s.store_id,
    store_name: s.store_name,
    agent_name: s.agent_name,
    reveal_virtual: s.reveal_virtual,
    about: s.about ?? "",
    price_source: s.price_source,
    price_integration_enabled: s.price_integration_enabled,
    kommo_subdomain: s.kommo_subdomain ?? "",
    kommo_account_id: s.kommo_account_id ?? "",
    ai_model: s.ai_model ?? "claude-sonnet-4-5",
    agent_paused: s.agent_paused,
    kommo_pipeline_id: s.kommo_pipeline_id ?? "",
    kommo_human_stage_id: s.kommo_human_stage_id ?? "",
    default_responsible_user_id: s.default_responsible_user_id ?? "",
    handoff_target: s.handoff_target ?? "",
    handoff_stop_bot: s.handoff_stop_bot,
    handoff_assign_user: s.handoff_assign_user,
    handoff_move_stage: s.handoff_move_stage,
    handoff_add_note: s.handoff_add_note,
    active: s.active,
  };
}

function LojasPage() {
  const { stores, loading, refetch } = useStores();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { isAdmin } = useProfile(user?.id);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Store | null>(null);
  const [form, setForm] = useState<FormState>(vazio);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        about: form.about || null,
        kommo_subdomain: form.kommo_subdomain || null,
        kommo_account_id: form.kommo_account_id || null,
        ai_model: form.ai_model || "claude-sonnet-4-5",
        kommo_pipeline_id: form.kommo_pipeline_id || null,
        kommo_human_stage_id: form.kommo_human_stage_id || null,
        default_responsible_user_id: form.default_responsible_user_id || null,
        handoff_target: form.handoff_target || null,
      };
      if (editando) {
        const { error } = await supabase.from("stores").update(payload).eq("id", editando.id);
        if (error) throw error;
        await registrarAuditoria({
          action: "store.update",
          entity: "stores",
          entityId: editando.id,
          storeId: editando.id,
        });
      } else {
        const { data, error } = await supabase.from("stores").insert(payload).select("id").single();
        if (error) throw error;
        await registrarAuditoria({
          action: "store.create",
          entity: "stores",
          entityId: data.id,
          storeId: data.id,
        });
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Loja atualizada." : "Loja criada.");
      setAberto(false);
      setEditando(null);
      setForm(vazio);
      refetch();
      void qc.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (s: Store) => {
      const { error } = await supabase
        .from("stores")
        .update({ deleted_at: new Date().toISOString(), active: false })
        .eq("id", s.id);
      if (error) throw error;
      await registrarAuditoria({
        action: "store.soft_delete",
        entity: "stores",
        entityId: s.id,
        storeId: s.id,
      });
    },
    onSuccess: () => {
      toast.success("Loja arquivada.");
      refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      title="Lojas"
      description="Configuração operacional de cada loja atendida pelo agente."
      actions={
        isAdmin ? (
          <Button
            size="sm"
            onClick={() => {
              setEditando(null);
              setForm(vazio);
              setAberto(true);
            }}
          >
            <Plus className="size-4" /> Nova loja
          </Button>
        ) : null
      }
    >
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-base">Lojas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
          ) : stores.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma loja cadastrada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Kommo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.store_id}</TableCell>
                    <TableCell>{s.store_name}</TableCell>
                    <TableCell>{s.agent_name}</TableCell>
                    <TableCell className="text-xs">
                      {s.price_source === "manual" ? "Manual" : "API externa"}
                      {s.price_integration_enabled ? " · ligada" : " · desligada"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.kommo_subdomain ?? "não configurado"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.active ? "default" : "outline"}>
                        {s.active ? "Ativa" : "Em configuração"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditando(s);
                              setForm(fromStore(s));
                              setAberto(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => remover.mutate(s)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar loja" : "Nova loja"}</DialogTitle>
            <DialogDescription>
              Somente configuração não sensível. Tokens e chaves ficam nos segredos do backend.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Identificador (store_id)</Label>
              <Input
                value={form.store_id}
                onChange={(e) => set("store_id", e.target.value)}
                placeholder="loja-piloto"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nome da loja</Label>
              <Input value={form.store_name} onChange={(e) => set("store_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nome do agente</Label>
              <Input value={form.agent_name} onChange={(e) => set("agent_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Origem do preço</Label>
              <Select
                value={form.price_source}
                onValueChange={(v) => set("price_source", v as FormState["price_source"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (catálogo)</SelectItem>
                  <SelectItem value="api_externa">API externa (extensão futura)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Sobre a loja</Label>
              <Textarea
                rows={3}
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subdomínio Kommo</Label>
              <Input
                value={form.kommo_subdomain}
                onChange={(e) => set("kommo_subdomain", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ID da conta Kommo (kommo_account_id)</Label>
              <Input
                value={form.kommo_account_id}
                onChange={(e) => set("kommo_account_id", e.target.value)}
                placeholder="Ex.: 84591"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo Claude do agente</Label>
              <Input
                value={form.ai_model}
                onChange={(e) => set("ai_model", e.target.value)}
                placeholder="claude-sonnet-4-5"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pipeline ID</Label>
              <Input
                value={form.kommo_pipeline_id}
                onChange={(e) => set("kommo_pipeline_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Etapa "Atendimento Humano" (ID)</Label>
              <Input
                value={form.kommo_human_stage_id}
                onChange={(e) => set("kommo_human_stage_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável padrão (ID Kommo)</Label>
              <Input
                value={form.default_responsible_user_id}
                onChange={(e) => set("default_responsible_user_id", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Destino do handoff</Label>
              <Input
                value={form.handoff_target}
                onChange={(e) => set("handoff_target", e.target.value)}
                placeholder="Equipe comercial"
              />
            </div>
          </div>

          <div className="mt-2 space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">Ações do handoff</p>
            {(
              [
                ["handoff_stop_bot", "Parar o bot"],
                ["handoff_assign_user", "Atribuir vendedor"],
                ["handoff_move_stage", "Mover para etapa Atendimento Humano"],
                ["handoff_add_note", "Registrar nota no lead"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between">
                <Label className="font-normal">{label}</Label>
                <Switch checked={form[k]} onCheckedChange={(v) => set(k, v)} />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <Label className="font-normal">Revelar que é loja virtual quando perguntado</Label>
              <Switch
                checked={form.reveal_virtual}
                onCheckedChange={(v) => set("reveal_virtual", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Integração de preço ligada</Label>
              <Switch
                checked={form.price_integration_enabled}
                onCheckedChange={(v) => set("price_integration_enabled", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Loja ativa</Label>
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 sm:col-span-2">
              <div>
                <Label>Agente pausado</Label>
                <p className="text-xs text-muted-foreground">
                  Com o agente pausado, toda conversa vai direto para atendimento humano.
                </p>
              </div>
              <Switch
                checked={form.agent_paused}
                onCheckedChange={(v) => set("agent_paused", v)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}