import { z } from "zod";

export const TEMPERATURAS = ["fria", "morna", "quente"] as const;
export const ESTAGIOS = ["abertura", "desenvolvimento", "ancoragem", "pre_fechamento", "handoff"] as const;
export const ACOES = ["conversar", "passar_preco", "encaminhar_humano"] as const;
export const MOTIVOS_HANDOFF = [
  "sinal_fechamento",
  "troca",
  "insistencia_preco",
  "pedido_humano",
  "fora_escopo",
  "falha_tecnica",
] as const;
export const CHANNELS = ["whatsapp", "instagram", "outro"] as const;

export const DEFAULT_AI_MODEL = "claude-sonnet-4-5";

export const agentInputSchema = z.object({
  store_id: z.string().min(1).max(120),
  contact_id: z.string().min(1).max(120),
  lead_id: z.string().min(1).max(120),
  conversation_id: z.string().min(1).max(120),
  message_text: z.string().min(1).max(4000),
  return_url: z.string().url().max(2000),
  event_id: z.string().min(1).max(200),
  channel: z.enum(CHANNELS),
});
export type AgentInput = z.infer<typeof agentInputSchema>;

export const agentOutputSchema = z
  .object({
    resposta: z.string().min(1).max(4000),
    temperatura_lead: z.enum(TEMPERATURAS),
    estagio: z.enum(ESTAGIOS),
    acao: z.enum(ACOES),
    motivo_handoff: z.enum(MOTIVOS_HANDOFF).nullable(),
  })
  .superRefine((v, ctx) => {
    if (v.acao === "encaminhar_humano" && !v.motivo_handoff) {
      ctx.addIssue({
        code: "custom",
        path: ["motivo_handoff"],
        message: "motivo_handoff é obrigatório quando acao = encaminhar_humano",
      });
    }
  });
export type AgentOutput = z.infer<typeof agentOutputSchema>;

export const FALLBACK_MESSAGE =
  "Só um instante, vou chamar alguém do time para te ajudar melhor por aqui.";

export const FALLBACK_OUTPUT: AgentOutput = {
  resposta: FALLBACK_MESSAGE,
  temperatura_lead: "morna",
  estagio: "handoff",
  acao: "encaminhar_humano",
  motivo_handoff: "fora_escopo",
};

export type ParseResult = {
  output: AgentOutput;
  valid: boolean;
  errors: string[];
  usedFallback: boolean;
};

/** Extrai o primeiro objeto JSON de um texto livre do modelo. */
function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Nenhum objeto JSON encontrado na resposta.");
  return JSON.parse(candidate.slice(start, end + 1));
}

/** Nunca lança: qualquer saída fora do contrato vira o fallback seguro. */
export function parseAgentOutput(raw: string | null | undefined): ParseResult {
  if (!raw) {
    return { output: FALLBACK_OUTPUT, valid: false, errors: ["Resposta vazia do modelo."], usedFallback: true };
  }
  let data: unknown;
  try {
    data = extractJson(raw);
  } catch (e) {
    return {
      output: FALLBACK_OUTPUT,
      valid: false,
      errors: [e instanceof Error ? e.message : "JSON inválido."],
      usedFallback: true,
    };
  }
  const parsed = agentOutputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      output: FALLBACK_OUTPUT,
      valid: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`),
      usedFallback: true,
    };
  }
  return { output: parsed.data, valid: true, errors: [], usedFallback: false };
}

export const CONTRACT_INSTRUCTIONS = `Responda SOMENTE com um objeto JSON válido, sem texto extra, no formato:
{"resposta":"texto","temperatura_lead":"fria|morna|quente","estagio":"abertura|desenvolvimento|ancoragem|pre_fechamento|handoff","acao":"conversar|passar_preco|encaminhar_humano","motivo_handoff":null}
Quando acao = "encaminhar_humano", motivo_handoff é obrigatório e deve ser um de: ${MOTIVOS_HANDOFF.join(", ")}.`;