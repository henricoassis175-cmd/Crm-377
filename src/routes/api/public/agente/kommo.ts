import { createFileRoute } from "@tanstack/react-router";
import { isReturnUrlPermitida } from "@/lib/agent-contract";

const CANAIS = ["whatsapp", "instagram", "outro"] as const;
type Canal = (typeof CANAIS)[number];

interface Payload {
  store_id: string;
  event_id: string;
  message_text: string;
  return_url: string;
  contact_id?: string | undefined;
  lead_id?: string | undefined;
  conversation_id?: string | undefined;
  channel?: Canal | undefined;
}

function texto(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function validar(body: unknown): { ok: true; data: Payload } | { ok: false; erro: string } {
  if (!body || typeof body !== "object") return { ok: false, erro: "corpo inválido" };
  const b = body as Record<string, unknown>;
  const store_id = texto(b["store_id"]);
  const event_id = texto(b["event_id"]);
  const message_text = texto(b["message_text"]);
  const return_url = texto(b["return_url"]);
  const faltando = [
    !store_id && "store_id",
    !event_id && "event_id",
    !message_text && "message_text",
    !return_url && "return_url",
  ].filter(Boolean);
  if (faltando.length) return { ok: false, erro: `campos obrigatórios: ${faltando.join(", ")}` };
  const canalBruto = texto(b["channel"]);
  const channel: Canal = (CANAIS as readonly string[]).includes(canalBruto)
    ? (canalBruto as Canal)
    : "outro";
  return {
    ok: true,
    data: {
      store_id,
      event_id,
      message_text,
      return_url,
      contact_id: texto(b["contact_id"]) || undefined,
      lead_id: texto(b["lead_id"]) || undefined,
      conversation_id: texto(b["conversation_id"]) || undefined,
      channel,
    },
  };
}

async function autenticado(request: Request): Promise<boolean> {
  const secret = process.env["CRM377_WEBHOOK_SECRET"];
  if (!secret) return false;
  const match = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "");
  const token = match?.[1];
  if (!token) return false;
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (v: string) => createHash("sha256").update(v, "utf8").digest();
  return timingSafeEqual(digest(token), digest(secret));
}

export const Route = createFileRoute("/api/public/agente/kommo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await autenticado(request))) {
          return new Response("Unauthorized", { status: 401 });
        }

        let bruto: unknown;
        try {
          bruto = await request.json();
        } catch {
          return Response.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
        }

        const validado = validar(bruto);
        if (!validado.ok) {
          return Response.json({ ok: false, erro: validado.erro }, { status: 400 });
        }
        const payload = validado.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: loja } = await supabaseAdmin
          .from("stores")
          .select("id, kommo_subdomain, active, deleted_at")
          .eq("store_id", payload.store_id)
          .maybeSingle();

        if (!loja || loja.deleted_at || !loja.active) {
          return Response.json(
            { ok: false, erro: "loja não encontrada ou inativa" },
            { status: 404 },
          );
        }

        if (!isReturnUrlPermitida(payload.return_url, loja.kommo_subdomain)) {
          return Response.json({ ok: false, erro: "return_url não permitida" }, { status: 400 });
        }

        // Idempotência: event_id é único em webhook_inbox.
        const { error: erroInbox } = await supabaseAdmin.from("webhook_inbox").insert({
          event_id: payload.event_id,
          store_id: loja.id,
          source: "kommo",
          payload: { ...payload },
        });

        if (erroInbox) {
          if (erroInbox.code === "23505") {
            return Response.json({ ok: true, duplicado: true }, { status: 200 });
          }
          return Response.json({ ok: false, erro: "falha ao registrar evento" }, { status: 500 });
        }

        const { data: cfgN8n } = await supabaseAdmin
          .from("integration_settings")
          .select("config")
          .eq("store_id", loja.id)
          .eq("kind", "n8n")
          .maybeSingle();

        const webhookUrl =
          (cfgN8n?.config as { webhook_url?: string } | null)?.webhook_url?.trim() ?? "";

        if (!webhookUrl.startsWith("https://")) {
          await supabaseAdmin.from("integration_events").insert({
            store_id: loja.id,
            kind: "n8n",
            event_type: "encaminhar_webhook",
            success: false,
            detail: { erro: "webhook do n8n não configurado", event_id: payload.event_id },
          });
          return Response.json({ ok: true, encaminhado: false }, { status: 202 });
        }

        // Repasse assíncrono: não bloqueia a resposta HTTP (Kommo espera ~2s).
        const inicio = Date.now();
        void fetch(webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(async (r) => {
            await supabaseAdmin.from("integration_events").insert({
              store_id: loja.id,
              kind: "n8n",
              event_type: "encaminhar_webhook",
              success: r.ok,
              latency_ms: Date.now() - inicio,
              detail: { status: r.status, event_id: payload.event_id },
            });
          })
          .catch(async (e: unknown) => {
            await supabaseAdmin.from("integration_events").insert({
              store_id: loja.id,
              kind: "n8n",
              event_type: "encaminhar_webhook",
              success: false,
              latency_ms: Date.now() - inicio,
              detail: { erro: String(e), event_id: payload.event_id },
            });
          });

        return Response.json({ ok: true, encaminhado: true }, { status: 200 });
      },
    },
  },
});