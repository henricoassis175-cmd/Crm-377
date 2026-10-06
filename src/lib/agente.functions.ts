import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseAgentOutput, FALLBACK_OUTPUT } from "@/lib/agent-contract";

export const MODELO_PADRAO = "claude-sonnet-4-5";

/** Modelo configurável no backend. Nunca exposto ao navegador como credencial. */
function modeloDoAmbiente(modeloDaLoja?: string | null): string {
  return modeloDaLoja || process.env["ANTHROPIC_MODEL"] || MODELO_PADRAO;
}

/** IDs de workspace da Anthropic têm o formato `wrkspc_...`. Valores fora desse padrão são ignorados. */
function workspaceIdValido(): string | null {
  const raw = (process.env["ANTHROPIC_WORKSPACE_ID"] ?? "").trim();
  return /^wrkspc_[A-Za-z0-9]{10,}$/.test(raw) ? raw : null;
}

/** Chamada única à Messages API da Anthropic. A chave só existe no servidor. */
async function chamarAnthropic(params: {
  apiKey: string;
  model: string;
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxOutputTokens: number;
}) {
  const workspaceId = workspaceIdValido();
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": params.apiKey,
      "anthropic-version": "2023-06-01",
      ...(workspaceId ? { "anthropic-workspace-id": workspaceId } : {}),
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: params.maxOutputTokens,
      ...(params.system ? { system: params.system } : {}),
      messages: params.messages,
    }),
  });

  const body = await resp.text();
  if (!resp.ok) {
    // Nunca ecoar cabeçalhos ou credenciais; apenas status e corpo truncado da Anthropic.
    return {
      ok: false as const,
      status: resp.status,
      erro: `Anthropic respondeu ${resp.status}: ${body.slice(0, 300)}`,
      texto: "",
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  const json = JSON.parse(body) as {
    content?: { type?: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const texto = (json.content ?? [])
    .filter((c) => c.type === "text" || typeof c.text === "string")
    .map((c) => c.text ?? "")
    .join("");

  return {
    ok: true as const,
    status: resp.status,
    erro: null,
    texto,
    inputTokens: json.usage?.input_tokens ?? 0,
    outputTokens: json.usage?.output_tokens ?? 0,
  };
}


const entradaLab = z.object({
  storeId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["cliente", "agente"]), content: z.string().max(2000) }))
    .max(15)
    .default([]),
  priceEnabled: z.boolean().default(true),
  scenarioId: z.string().uuid().nullable().default(null),
  expected: z.record(z.string(), z.unknown()).default({}),
});

export const executarTeste = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => entradaLab.parse(input))
  .handler(async ({ data, context }) => {
    const inicio = Date.now();
    const { supabase, userId } = context;

    const { data: store, error: storeErr } = await supabase
      .from("stores")
      .select("*")
      .eq("id", data.storeId)
      .maybeSingle();
    if (storeErr || !store) throw new Error("Loja não encontrada ou sem acesso.");

    const [{ data: prompt }, { data: knowledge }, { data: catalogo }] = await Promise.all([
      supabase
        .from("prompt_versions")
        .select("content")
        .eq("store_id", data.storeId)
        .eq("status", "publicado")
        .maybeSingle(),
      supabase
        .from("knowledge_versions")
        .select("content")
        .eq("store_id", data.storeId)
        .eq("status", "publicado")
        .maybeSingle(),
      supabase
        .from("catalog_items")
        .select("model, storage, condition, color, battery_health, price_cents, stock")
        .eq("store_id", data.storeId)
        .eq("available", true)
        .gt("stock", 0)
        .is("deleted_at", null)
        .limit(80),
    ]);

    const modelo = modeloDoAmbiente(store.ai_model);
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      return {
        ok: false as const,
        motivo: "credencial_ausente" as const,
        mensagem:
          "ANTHROPIC_API_KEY não está configurada nos segredos do backend. O teste real não pode ser executado.",
        saida: FALLBACK_OUTPUT,
        erros: ["ANTHROPIC_API_KEY ausente"],
        latencia_ms: 0,
        modelo,
      };
    }

    const listaPrecos = data.priceEnabled
      ? (catalogo ?? [])
          .map(
            (i) =>
              `- ${i.model} ${i.storage} ${i.condition}${i.color ? ` ${i.color}` : ""}${
                i.battery_health ? ` bateria ${i.battery_health}%` : ""
              }: R$ ${(i.price_cents / 100).toFixed(2)} (estoque ${i.stock})`,
          )
          .join("\n")
      : "(integração de preço desligada nesta execução — não informe valores)";

    const system = [
      prompt?.content ?? "",
      knowledge?.content ?? "",
      `Loja: ${store.store_name}. Agente: ${store.agent_name}. Revelar que é loja virtual quando perguntado: ${
        store.reveal_virtual ? "sim" : "não"
      }.`,
      `Catálogo disponível (única fonte de preço, estoque e produtos):\n${
        listaPrecos || "(sem itens disponíveis)"
      }`,
      "Nunca invente preço, estoque, produto, desconto, prazo, forma de pagamento ou política. Se a informação não estiver acima, diga que vai confirmar com um vendedor e encaminhe para humano.",
      'Responda SOMENTE com JSON válido: {"resposta":string,"temperatura_lead":"fria|morna|quente","estagio":"abertura|desenvolvimento|ancoragem|pre_fechamento|handoff","acao":"conversar|passar_preco|encaminhar_humano","motivo_handoff":null|"sinal_fechamento"|"troca"|"insistencia_preco"|"pedido_humano"|"fora_escopo"}',
    ]
      .filter(Boolean)
      .join("\n\n");

    let texto = "";
    let erroChamada: string | null = null;
    let inputTokens = 0;
    let outputTokens = 0;
    let statusChamada = "ok";
    let codigoErro: string | null = null;

    try {
      const r = await chamarAnthropic({
        apiKey,
        model: modelo,
        maxOutputTokens: 900,
        system,
        messages: [
          ...data.history.map((h) => ({
            role: (h.role === "cliente" ? "user" : "assistant") as "user" | "assistant",
            content: h.content,
          })),
          { role: "user" as const, content: data.message },
        ],
      });
      if (!r.ok) {
        erroChamada = r.erro;
        statusChamada = "erro";
        codigoErro = String(r.status);
      } else {
        texto = r.texto;
        inputTokens = r.inputTokens;
        outputTokens = r.outputTokens;
      }
    } catch (e) {
      erroChamada = e instanceof Error ? e.message : "Falha de rede na chamada à Anthropic";
      statusChamada = "erro";
      codigoErro = "network";
    }

    const latencia = Date.now() - inicio;

    await supabase.from("ai_usage_logs").insert({
      store_id: data.storeId,
      model: modelo,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      latency_ms: latencia,
      status: statusChamada,
      error_code: codigoErro,
      source: "laboratorio",
    });

    if (erroChamada) {
      return {
        ok: false as const,
        motivo: "falha_chamada" as const,
        mensagem: erroChamada,
        saida: FALLBACK_OUTPUT,
        erros: [erroChamada],
        latencia_ms: latencia,
        modelo,
      };
    }

    const parsed = parseAgentOutput(texto);
    const esperado = data.expected as Record<string, unknown>;
    const falhas: string[] = [...parsed.erros];
    for (const campo of ["temperatura_lead", "estagio", "acao", "motivo_handoff"] as const) {
      if (esperado[campo] !== undefined && esperado[campo] !== null) {
        const obtido = parsed.data[campo];
        if (obtido !== esperado[campo])
          falhas.push(`${campo}: esperado ${String(esperado[campo])}, obtido ${String(obtido)}`);
      }
    }
    if (!data.priceEnabled && parsed.data.acao === "passar_preco") {
      falhas.push("informou preço com integração de preço desligada");
    }

    const passou = falhas.length === 0;

    await supabase.from("test_runs").insert({
      store_id: data.storeId,
      scenario_id: data.scenarioId,
      input_message: data.message,
      price_enabled: data.priceEnabled,
      expected: esperado as never,
      obtained: parsed.data as never,
      failures: falhas as never,
      passed: passou,
      latency_ms: latencia,
      created_by: userId,
    });

    await supabase.from("integration_events").insert({
      store_id: data.storeId,
      kind: "anthropic",
      event_type: "laboratorio.execucao",
      success: passou,
      latency_ms: latencia,
      detail: { falhas, modelo } as never,
    });

    return {
      ok: true as const,
      motivo: null,
      mensagem: null,
      saida: parsed.data,
      erros: falhas,
      latencia_ms: latencia,
      modelo,
    };
  });

const entradaTeste = z.object({
  storeId: z.string().uuid(),
  kind: z.enum(["supabase", "n8n", "kommo", "anthropic"]),
});

export const testarIntegracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => entradaTeste.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const inicio = Date.now();
    let sucesso = false;
    let detalhe = "";

    if (data.kind === "supabase") {
      const { error } = await supabase
        .from("stores")
        .select("id")
        .eq("id", data.storeId)
        .maybeSingle();
      sucesso = !error;
      detalhe = error ? error.message : "Leitura autenticada com RLS funcionando.";
    }

    if (data.kind === "anthropic") {
      const apiKey = process.env["ANTHROPIC_API_KEY"];
      if (!apiKey) {
        detalhe = "ANTHROPIC_API_KEY não configurada nos segredos do backend.";
      } else {
        const { data: store } = await supabase
          .from("stores")
          .select("ai_model")
          .eq("id", data.storeId)
          .maybeSingle();
        const modelo = modeloDoAmbiente(store?.ai_model);
        try {
          const r = await chamarAnthropic({
            apiKey,
            model: modelo,
            maxOutputTokens: 16,
            messages: [{ role: "user" as const, content: "ping" }],
          });
          sucesso = r.ok;
          detalhe = r.ok ? `Chave válida e modelo ${modelo} acessível.` : (r.erro ?? "Falha.");
        } catch (e) {
          detalhe = e instanceof Error ? e.message : "Falha de rede.";
        }
      }
    }

    if (data.kind === "n8n") {
      const { data: cfg } = await supabase
        .from("integration_settings")
        .select("config")
        .eq("store_id", data.storeId)
        .eq("kind", "n8n")
        .maybeSingle();
      const url = (cfg?.config as { webhook_url?: string } | null)?.webhook_url;
      if (!url) {
        detalhe = "URL do webhook n8n não informada na configuração.";
      } else if (!url.startsWith("https://")) {
        detalhe = "A URL do webhook precisa usar HTTPS.";
      } else {
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ping: true, source: "crm377-painel" }),
          });
          sucesso = r.ok;
          detalhe = `Webhook respondeu ${r.status}.`;
        } catch (e) {
          detalhe = e instanceof Error ? e.message : "Falha de rede ao chamar o webhook.";
        }
      }
    }

    if (data.kind === "kommo") {
      const { data: store } = await supabase
        .from("stores")
        .select(
          "kommo_subdomain, kommo_account_id, kommo_pipeline_id, kommo_human_stage_id, default_responsible_user_id",
        )
        .eq("id", data.storeId)
        .maybeSingle();
      const faltando = Object.entries(store ?? {})
        .filter(([, v]) => !v)
        .map(([k]) => k);
      sucesso = faltando.length === 0;
      detalhe = sucesso
        ? "Configuração completa. O token OAuth do Kommo fica no n8n; a conexão real é validada por lá."
        : `Configuração pendente. Faltam campos: ${faltando.join(", ")}.`;
    }

    const latencia = Date.now() - inicio;

    await supabase
      .from("integration_settings")
      .update({
        status: sucesso ? "testado" : "configurado",
        last_tested_at: new Date().toISOString(),
        last_test_result: detalhe,
      })
      .eq("store_id", data.storeId)
      .eq("kind", data.kind);

    await supabase.from("integration_events").insert({
      store_id: data.storeId,
      kind: data.kind,
      event_type: "teste_manual",
      success: sucesso,
      latency_ms: latencia,
      detail: { detalhe } as never,
    });

    return { sucesso, detalhe, latencia_ms: latencia };
  });