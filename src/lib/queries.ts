import { queryOptions } from "@tanstack/react-query";
import { subDays, startOfDay } from "date-fns";
import { requireDb } from "@/integrations/supabase/client";
import type { Estagio, Temperatura } from "./db-types";

// Todas as query keys de dados de loja incluem store_id.
export const qk = {
  stores: ["stores"] as const,
  dashboard: (s: string) => ["dashboard", s] as const,
  leads: (s: string, f: LeadFilters) => ["leads", s, f] as const,
  messages: (s: string, leadId: string) => ["messages", s, leadId] as const,
  handoffs: (s: string) => ["handoffs", s] as const,
  catalog: (s: string) => ["catalog", s] as const,
  prompts: (s: string) => ["prompt_versions", s] as const,
  knowledge: (s: string) => ["knowledge_versions", s] as const,
  scenarios: (s: string) => ["test_scenarios", s] as const,
  runs: (s: string) => ["test_runs", s] as const,
  integrations: (s: string) => ["integration_settings", s] as const,
  usage: (s: string, p: Period) => ["ai_usage_logs", s, p] as const,
  audit: (s: string) => ["audit_logs", s] as const,
  members: (s: string) => ["store_members", s] as const,
};

export type Period = "hoje" | "7d" | "30d";
export function periodStart(p: Period): string {
  const now = new Date();
  const d = p === "hoje" ? startOfDay(now) : subDays(now, p === "7d" ? 7 : 30);
  return d.toISOString();
}

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error("Resposta vazia do servidor.");
  return res.data;
}

export const storesQuery = () =>
  queryOptions({
    queryKey: qk.stores,
    queryFn: async () =>
      check(await requireDb().from("stores").select("*").is("deleted_at", null).order("store_name")),
  });

export type LeadFilters = {
  search: string;
  temperatura: Temperatura | "todas";
  estagio: Estagio | "todos";
};

export const leadsQuery = (storeId: string, f: LeadFilters) =>
  queryOptions({
    queryKey: qk.leads(storeId, f),
    queryFn: async () => {
      const db = requireDb();
      let q = db
        .from("leads")
        .select("*")
        .eq("store_id", storeId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (f.temperatura !== "todas") q = q.eq("temperatura", f.temperatura);
      if (f.estagio !== "todos") q = q.eq("estagio", f.estagio);
      const leads = check(await q);
      const contactIds = [...new Set(leads.map((l) => l.contact_id).filter((x): x is string => !!x))];
      const contacts = contactIds.length
        ? check(await db.from("contacts").select("*").eq("store_id", storeId).in("id", contactIds))
        : [];
      const byId = new Map(contacts.map((c) => [c.id, c]));
      const merged = leads.map((l) => ({ lead: l, contact: l.contact_id ? (byId.get(l.contact_id) ?? null) : null }));
      const term = f.search.trim().toLowerCase();
      if (!term) return merged;
      return merged.filter(({ lead, contact }) =>
        `${contact?.name ?? ""} ${lead.kommo_lead_id ?? ""}`.toLowerCase().includes(term),
      );
    },
  });

export const messagesQuery = (storeId: string, leadId: string) =>
  queryOptions({
    queryKey: qk.messages(storeId, leadId),
    queryFn: async () => {
      const db = requireDb();
      const convs = check(
        await db.from("conversations").select("*").eq("store_id", storeId).eq("lead_id", leadId),
      );
      if (!convs.length) return [];
      return check(
        await db
          .from("messages")
          .select("*")
          .eq("store_id", storeId)
          .in(
            "conversation_id",
            convs.map((c) => c.id),
          )
          .order("created_at", { ascending: true })
          .limit(500),
      );
    },
  });

export const handoffsQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.handoffs(storeId),
    queryFn: async () =>
      check(
        await requireDb()
          .from("handoffs")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .limit(200),
      ),
  });

export const catalogQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.catalog(storeId),
    queryFn: async () =>
      check(await requireDb().from("catalog_items").select("*").eq("store_id", storeId).order("name")),
  });

export const promptsQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.prompts(storeId),
    queryFn: async () =>
      check(
        await requireDb()
          .from("prompt_versions")
          .select("*")
          .eq("store_id", storeId)
          .order("version", { ascending: false }),
      ),
  });

export const knowledgeQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.knowledge(storeId),
    queryFn: async () =>
      check(
        await requireDb()
          .from("knowledge_versions")
          .select("*")
          .eq("store_id", storeId)
          .order("version", { ascending: false }),
      ),
  });

export const scenariosQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.scenarios(storeId),
    queryFn: async () =>
      check(await requireDb().from("test_scenarios").select("*").eq("store_id", storeId).order("name")),
  });

export const runsQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.runs(storeId),
    queryFn: async () =>
      check(
        await requireDb()
          .from("test_runs")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .limit(30),
      ),
  });

export const integrationsQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.integrations(storeId),
    queryFn: async () =>
      check(
        await requireDb()
          .from("integration_settings")
          .select("*")
          .or(`store_id.eq.${storeId},store_id.is.null`),
      ),
  });

export const usageQuery = (storeId: string, p: Period) =>
  queryOptions({
    queryKey: qk.usage(storeId, p),
    queryFn: async () =>
      check(
        await requireDb()
          .from("ai_usage_logs")
          .select("*")
          .eq("store_id", storeId)
          .gte("created_at", periodStart(p))
          .order("created_at", { ascending: false })
          .limit(1000),
      ),
  });

export const auditQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.audit(storeId),
    queryFn: async () =>
      check(
        await requireDb()
          .from("audit_logs")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false })
          .limit(200),
      ),
  });

export const membersQuery = (storeId: string) =>
  queryOptions({
    queryKey: qk.members(storeId),
    queryFn: async () => {
      const db = requireDb();
      const members = check(await db.from("store_members").select("*").eq("store_id", storeId));
      const ids = members.map((m) => m.user_id);
      const profiles = ids.length ? check(await db.from("profiles").select("*").in("id", ids)) : [];
      const byId = new Map(profiles.map((p) => [p.id, p]));
      return members.map((m) => ({ member: m, profile: byId.get(m.user_id) ?? null }));
    },
  });

/** KPIs do dashboard — cada um é uma consulta independente (falha isolada). */
export const kpiQuery = (storeId: string, kpi: "mensagens7d" | "leadsAtivos" | "handoffsPendentes" | "latencia" | "falhas") =>
  queryOptions({
    queryKey: [...qk.dashboard(storeId), kpi] as const,
    queryFn: async (): Promise<number | null> => {
      const db = requireDb();
      const since = periodStart("7d");
      switch (kpi) {
        case "mensagens7d": {
          const r = await db.from("messages").select("id", { count: "exact", head: true }).eq("store_id", storeId).gte("created_at", since);
          if (r.error) throw new Error(r.error.message);
          return r.count ?? 0;
        }
        case "leadsAtivos": {
          const r = await db.from("leads").select("id", { count: "exact", head: true }).eq("store_id", storeId).eq("active", true);
          if (r.error) throw new Error(r.error.message);
          return r.count ?? 0;
        }
        case "handoffsPendentes": {
          const r = await db.from("handoffs").select("id", { count: "exact", head: true }).eq("store_id", storeId).eq("status", "pendente");
          if (r.error) throw new Error(r.error.message);
          return r.count ?? 0;
        }
        case "falhas": {
          const r = await db.from("integration_events").select("id", { count: "exact", head: true }).eq("store_id", storeId).eq("success", false).gte("created_at", since);
          if (r.error) throw new Error(r.error.message);
          return r.count ?? 0;
        }
        case "latencia": {
          const rows = check(
            await db.from("messages").select("latency_ms").eq("store_id", storeId).gte("created_at", since).not("latency_ms", "is", null).limit(1000),
          );
          const vals = rows.map((r) => r.latency_ms).filter((v): v is number => v != null);
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        }
      }
    },
  });

export const leadDistributionQuery = (storeId: string) =>
  queryOptions({
    queryKey: [...qk.dashboard(storeId), "distribution"] as const,
    queryFn: async () =>
      check(
        await requireDb()
          .from("leads")
          .select("temperatura, estagio")
          .eq("store_id", storeId)
          .eq("active", true)
          .limit(5000),
      ),
  });