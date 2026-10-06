import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "login"
  | "logout"
  | "store.create"
  | "store.update"
  | "store.soft_delete"
  | "user.create"
  | "user.update"
  | "prompt.draft"
  | "prompt.publish"
  | "knowledge.draft"
  | "knowledge.publish"
  | "catalog.create"
  | "catalog.update"
  | "integration.update"
  | "integration.test"
  | "handoff.update"
  | "lab.run";

export type AuditEntry = {
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  storeId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Camada central de auditoria. Falhas de auditoria nunca quebram a ação do usuário,
 * mas são registradas no console para observabilidade.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("audit_logs").insert({
      user_id: data.user?.id ?? null,
      store_id: entry.storeId ?? null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
    });
    if (error) console.error("[audit] falha ao registrar", error.message);
  } catch (e) {
    console.error("[audit] erro inesperado", e);
  }
}