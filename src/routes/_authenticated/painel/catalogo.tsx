import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Download, Upload, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useStores } from "@/lib/store-context";
import { formatBRL, parseBRLToCents, formatDateTime } from "@/lib/format";
import { registrarAuditoria } from "@/lib/audit";
import type { Database } from "@/integrations/supabase/types";

type Item = Database["public"]["Tables"]["catalog_items"]["Row"];
type Condition = Database["public"]["Enums"]["item_condition"];

const condicoes: { value: Condition; label: string }[] = [
  { value: "lacrado", label: "Lacrado" },
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "vitrine", label: "Vitrine" },
];

export const Route = createFileRoute("/_authenticated/painel/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo | CRM 377 - Agente Comercial" },
      {
        name: "description",
        content: "Catálogo de aparelhos por loja: modelo, condição, preço e disponibilidade.",
      },
      { property: "og:title", content: "Catálogo | CRM 377" },
      {
        property: "og:description",
        content: "Fonte única de verdade de preços e disponibilidade do agente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatalogoPage,
});

type Form = {
  model: string;
  storage: string;
  condition: Condition;
  color: string;
  battery_health: string;
  price: string;
  stock: string;
  available: boolean;
  notes: string;
};
const vazio: Form = {
  model: "",
  storage: "",
  condition: "lacrado",
  color: "",
  battery_health: "",
  price: "",
  stock: "0",
  available: true,
  notes: "",
};

function CatalogoPage() {
  const { storeId, store } = useStores();
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtroCond, setFiltroCond] = useState<string>("todas");
  const [filtroDisp, setFiltroDisp] = useState<string>("todos");
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Item | null>(null);
  const [form, setForm] = useState<Form>(vazio);

  const { data, isLoading } = useQuery({
    queryKey: ["catalog", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("*")
        .eq("store_id", storeId!)
        .is("deleted_at", null)
        .order("model");
      if (error) throw error;
      return data as Item[];
    },
  });

  const itens = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (data ?? []).filter((i) => {
      if (t && ![i.model, i.storage, i.color ?? ""].join(" ").toLowerCase().includes(t))
        return false;
      if (filtroCond !== "todas" && i.condition !== filtroCond) return false;
      if (filtroDisp === "disponiveis" && !(i.available && i.stock > 0)) return false;
      if (filtroDisp === "indisponiveis" && i.available && i.stock > 0) return false;
      return true;
    });
  }, [data, busca, filtroCond, filtroDisp]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("Selecione uma loja.");
      const payload = {
        store_id: storeId,
        model: form.model.trim(),
        storage: form.storage.trim(),
        condition: form.condition,
        color: form.color.trim() || null,
        battery_health: form.battery_health ? Number(form.battery_health) : null,
        price_cents: parseBRLToCents(form.price),
        stock: Number(form.stock) || 0,
        available: form.available,
        notes: form.notes.trim() || null,
      };
      if (!payload.model || !payload.storage)
        throw new Error("Modelo e armazenamento são obrigatórios.");
      if (editando) {
        const { error } = await supabase
          .from("catalog_items")
          .update(payload)
          .eq("id", editando.id);
        if (error) throw error;
        await registrarAuditoria({
          action: "catalog.update",
          entity: "catalog_items",
          entityId: editando.id,
          storeId,
        });
      } else {
        const { error } = await supabase.from("catalog_items").insert(payload);
        if (error) throw error;
        await registrarAuditoria({ action: "catalog.create", entity: "catalog_items", storeId });
      }
    },
    onSuccess: () => {
      toast.success("Item salvo.");
      setAberto(false);
      setEditando(null);
      setForm(vazio);
      void qc.invalidateQueries({ queryKey: ["catalog", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (item: Item) => {
      const { error } = await supabase
        .from("catalog_items")
        .update({ deleted_at: new Date().toISOString(), available: false })
        .eq("id", item.id);
      if (error) throw error;
      await registrarAuditoria({
        action: "catalog.soft_delete",
        entity: "catalog_items",
        entityId: item.id,
        storeId,
      });
    },
    onSuccess: () => {
      toast.success("Item removido do catálogo.");
      void qc.invalidateQueries({ queryKey: ["catalog", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function exportarCsv() {
    const linhas = [
      [
        "modelo",
        "armazenamento",
        "condicao",
        "cor",
        "bateria",
        "preco",
        "estoque",
        "disponivel",
        "atualizado_em",
      ],
      ...itens.map((i) => [
        i.model,
        i.storage,
        i.condition,
        i.color ?? "",
        i.battery_health ?? "",
        (i.price_cents / 100).toFixed(2),
        i.stock,
        i.available ? "sim" : "nao",
        i.updated_at,
      ]),
    ];
    const csv = linhas
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogo-${store?.store_id ?? "loja"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseLinhaCsv(linha: string): string[] {
    const out: string[] = [];
    let atual = "";
    let aspas = false;
    for (let i = 0; i < linha.length; i++) {
      const c = linha[i];
      if (c === '"') {
        if (aspas && linha[i + 1] === '"') {
          atual += '"';
          i++;
        } else aspas = !aspas;
      } else if ((c === "," || c === ";") && !aspas) {
        out.push(atual);
        atual = "";
      } else atual += c;
    }
    out.push(atual);
    return out.map((c) => c.trim());
  }

  const importar = useMutation({
    mutationFn: async (texto: string) => {
      if (!storeId) throw new Error("Selecione uma loja.");
      const linhas = texto
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (linhas.length < 2) throw new Error("Arquivo sem linhas de dados.");
      const cabecalho = parseLinhaCsv(linhas[0]!).map((c) =>
        c
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      );
      const col = (nome: string) => cabecalho.indexOf(nome);
      const iModelo = col("modelo");
      const iArm = col("armazenamento");
      const iPreco = col("preco");
      if (iModelo < 0 || iArm < 0 || iPreco < 0)
        throw new Error("O CSV precisa das colunas: modelo, armazenamento, preco.");
      const iCond = col("condicao");
      const iCor = col("cor");
      const iBat = col("bateria");
      const iEstoque = col("estoque");
      const iDisp = col("disponivel");
      const validas = new Set(condicoes.map((c) => c.value));

      const registros = linhas.slice(1).map((linha, idx) => {
        const v = parseLinhaCsv(linha);
        const modelo = v[iModelo] ?? "";
        const armazenamento = v[iArm] ?? "";
        if (!modelo || !armazenamento)
          throw new Error(`Linha ${idx + 2}: modelo e armazenamento são obrigatórios.`);
        const precoCents = parseBRLToCents(v[iPreco] ?? "");
        if (!Number.isFinite(precoCents) || precoCents <= 0)
          throw new Error(`Linha ${idx + 2}: preço inválido.`);
        const cond = (v[iCond] ?? "lacrado").toLowerCase();
        if (!validas.has(cond as Condition))
          throw new Error(`Linha ${idx + 2}: condição inválida (${cond}).`);
        const disp = (v[iDisp] ?? "sim").toLowerCase();
        const bateria = iBat >= 0 && v[iBat] ? Number(v[iBat]) : null;
        return {
          store_id: storeId,
          model: modelo,
          storage: armazenamento,
          condition: cond as Condition,
          color: iCor >= 0 && v[iCor] ? v[iCor]! : null,
          battery_health: bateria !== null && Number.isFinite(bateria) ? bateria : null,
          price_cents: precoCents,
          stock: iEstoque >= 0 ? Number(v[iEstoque] ?? 0) || 0 : 0,
          available: !["nao", "não", "false", "0"].includes(disp),
          notes: null,
        };
      });

      const { error } = await supabase.from("catalog_items").insert(registros);
      if (error) throw error;
      await registrarAuditoria({
        action: "catalog.import_csv",
        entity: "catalog_items",
        storeId,
        metadata: { itens: registros.length },
      });
      return registros.length;
    },
    onSuccess: (total) => {
      toast.success(`${total} item(ns) importado(s).`);
      void qc.invalidateQueries({ queryKey: ["catalog", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    importar.mutate(await file.text());
  }

  return (
    <AppShell
      title="Catálogo"
      description="Fonte única de preço e disponibilidade. O agente nunca informa valores fora daqui."
      actions={
        <div className="flex gap-2">
          <input
            id="csv-catalogo"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={aoEscolherArquivo}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={!storeId || importar.isPending}
            onClick={() => document.getElementById("csv-catalogo")?.click()}
          >
            <Upload className="size-4" /> Importar CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportarCsv} disabled={!itens.length}>
            <Download className="size-4" /> CSV
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditando(null);
              setForm(vazio);
              setAberto(true);
            }}
            disabled={!storeId}
          >
            <Plus className="size-4" /> Novo item
          </Button>
        </div>
      }
    >

      <Card className="border-border bg-surface">
        <CardHeader className="gap-3">
          <CardTitle className="text-base">Itens da loja {store?.store_name ?? ""}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar modelo, cor…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Select value={filtroCond} onValueChange={setFiltroCond}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as condições</SelectItem>
                {condicoes.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroDisp} onValueChange={setFiltroDisp}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponiveis">Disponíveis</SelectItem>
                <SelectItem value="indisponiveis">Indisponíveis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!storeId ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Cadastre uma loja para montar o catálogo.
            </p>
          ) : isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
          ) : itens.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum item no catálogo com esses filtros.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Armaz.</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Bateria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.model}</TableCell>
                    <TableCell>{i.storage}</TableCell>
                    <TableCell className="capitalize">{i.condition}</TableCell>
                    <TableCell>{i.color ?? "—"}</TableCell>
                    <TableCell>{i.battery_health ? `${i.battery_health}%` : "—"}</TableCell>
                    <TableCell>{formatBRL(i.price_cents)}</TableCell>
                    <TableCell>
                      <Badge variant={i.available && i.stock > 0 ? "default" : "outline"}>
                        {i.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(i.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditando(i);
                            setForm({
                              model: i.model,
                              storage: i.storage,
                              condition: i.condition,
                              color: i.color ?? "",
                              battery_health: i.battery_health?.toString() ?? "",
                              price: (i.price_cents / 100).toFixed(2),
                              stock: String(i.stock),
                              available: i.available,
                              notes: i.notes ?? "",
                            });
                            setAberto(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remover.mutate(i)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar item" : "Novo item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="iPhone 13"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Armazenamento</Label>
              <Input
                value={form.storage}
                onChange={(e) => setForm({ ...form, storage: e.target.value })}
                placeholder="128GB"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Condição</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => setForm({ ...form, condition: v as Condition })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {condicoes.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <Input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bateria (%) — opcional</Label>
              <Input
                inputMode="numeric"
                value={form.battery_health}
                onChange={(e) => setForm({ ...form, battery_health: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$)</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="3499,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estoque</Label>
              <Input
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="flex items-end justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <Label className="font-normal">Disponível</Label>
              <Switch
                checked={form.available}
                onCheckedChange={(v) => setForm({ ...form, available: v })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Observações internas</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}