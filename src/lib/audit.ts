import { supabase } from "@/integrations/supabase/client";

export async function registrarAuditoria(params: {
  action: string;
  entity?: string;
  entityId?: string;
  storeId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_logs").insert({
    user_id: data.user.id,
    action: params.action,
    entity: params.entity ?? null,
    entity_id: params.entityId ?? null,
    store_id: params.storeId ?? null,
    metadata: (params.metadata ?? {}) as never,
  });
}