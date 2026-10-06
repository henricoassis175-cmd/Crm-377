import { createFileRoute } from "@tanstack/react-router";
import { agentInputSchema } from "@/lib/agent-contract";
import { isAllowedKommoUrl } from "@/lib/return-url";

export const Route = createFileRoute("/api/public/agente/kommo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const length = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(length) && length > 64_000) {
          return Response.json({ error: "payload_too_large" }, { status: 413 });
        }
        const secret = process.env["AGENT_WEBHOOK_SECRET"];
        if (!secret) return Response.json({ error: "not_configured" }, { status: 503 });
        if (request.headers.get("x-agent-secret") !== secret) return Response.json({ error: "unauthorized" }, { status: 401 });
        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }
        const parsed = agentInputSchema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "invalid_input", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
        if (!isAllowedKommoUrl(parsed.data.return_url)) return Response.json({ error: "invalid_return_url" }, { status: 400 });
        // Execução do agente será ligada após conexão do banco e da chave Anthropic.
        return Response.json({ accepted: true, event_id: parsed.data.event_id }, { status: 202 });
      },
    },
  },
});