/**
 * Contrato do Agente 377 — entrada Kommo e saída JSON estrita.
 * Compartilhado entre laboratório, painel e documentação.
 */

export const TEMPERATURAS = ["fria", "morna", "quente"] as const;
export const ESTAGIOS = [
  "abertura",
  "desenvolvimento",
  "ancoragem",
  "pre_fechamento",
  "handoff",
] as const;
export const ACOES = ["conversar", "passar_preco", "encaminhar_humano"] as const;
export const MOTIVOS_HANDOFF = [
  "sinal_fechamento",
  "troca",
  "insistencia_preco",
  "pedido_humano",
  "fora_escopo",
] as const;

export type Temperatura = (typeof TEMPERATURAS)[number];
export type Estagio = (typeof ESTAGIOS)[number];
export type Acao = (typeof ACOES)[number];
export type MotivoHandoff = (typeof MOTIVOS_HANDOFF)[number];

export interface AgentInput {
  store_id: string;
  contact_id: string;
  lead_id: string;
  conversation_id: string;
  message_text: string;
  return_url: string;
  event_id: string;
  channel: "whatsapp" | "instagram" | "outro";
}

export interface AgentOutput {
  resposta: string;
  temperatura_lead: Temperatura;
  estagio: Estagio;
  acao: Acao;
  motivo_handoff: MotivoHandoff | null;
}

export const MENSAGEM_NEUTRA_FALLBACK =
  "Só um instante, vou chamar alguém do time para te ajudar melhor por aqui.";

export const FALLBACK_OUTPUT: AgentOutput = {
  resposta: MENSAGEM_NEUTRA_FALLBACK,
  temperatura_lead: "morna",
  estagio: "handoff",
  acao: "encaminhar_humano",
  motivo_handoff: "fora_escopo",
};

/** Remove crases/code fences e recorta do primeiro `{` ao último `}`. */
export function extractJsonBlock(raw: string): string | null {
  if (!raw) return null;
  const semFences = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/`/g, "")
    .trim();
  const inicio = semFences.indexOf("{");
  const fim = semFences.lastIndexOf("}");
  if (inicio === -1 || fim === -1 || fim <= inicio) return null;
  return semFences.slice(inicio, fim + 1);
}

export interface ParseResult {
  ok: boolean;
  data: AgentOutput;
  erros: string[];
}

/** Parse tolerante + validação estrita dos enums. Nunca lança. */
export function parseAgentOutput(raw: string): ParseResult {
  const erros: string[] = [];
  const bloco = extractJsonBlock(raw);
  if (!bloco) {
    return { ok: false, data: FALLBACK_OUTPUT, erros: ["JSON não encontrado na resposta"] };
  }
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(bloco) as Record<string, unknown>;
  } catch {
    return { ok: false, data: FALLBACK_OUTPUT, erros: ["JSON inválido"] };
  }

  const resposta = typeof obj["resposta"] === "string" ? (obj["resposta"] as string).trim() : "";
  if (!resposta) erros.push("campo 'resposta' ausente ou vazio");

  const temp = obj["temperatura_lead"];
  const est = obj["estagio"];
  const ac = obj["acao"];
  let motivoRaw = obj["motivo_handoff"];
  if (motivoRaw === "null" || motivoRaw === "") motivoRaw = null;

  const temperatura = TEMPERATURAS.includes(temp as Temperatura) ? (temp as Temperatura) : null;
  if (!temperatura) erros.push("temperatura_lead fora do enum");
  const estagio = ESTAGIOS.includes(est as Estagio) ? (est as Estagio) : null;
  if (!estagio) erros.push("estagio fora do enum");
  const acao = ACOES.includes(ac as Acao) ? (ac as Acao) : null;
  if (!acao) erros.push("acao fora do enum");

  let motivo: MotivoHandoff | null = null;
  if (motivoRaw !== null && motivoRaw !== undefined) {
    if (MOTIVOS_HANDOFF.includes(motivoRaw as MotivoHandoff)) {
      motivo = motivoRaw as MotivoHandoff;
    } else {
      erros.push("motivo_handoff fora do enum");
    }
  }
  if (acao === "encaminhar_humano" && !motivo) {
    erros.push("motivo_handoff obrigatório quando acao = encaminhar_humano");
  }

  if (erros.length) return { ok: false, data: FALLBACK_OUTPUT, erros };

  return {
    ok: true,
    erros: [],
    data: {
      resposta,
      temperatura_lead: temperatura!,
      estagio: estagio!,
      acao: acao!,
      motivo_handoff: motivo,
    },
  };
}

/** Allowlist de return_url: apenas HTTPS em domínios Kommo. */
export function isReturnUrlPermitida(url: string, kommoSubdomain?: string | null): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    const dominiosOk = ["kommo.com", "amocrm.com", "amocrm.ru"];
    const dominioOk = dominiosOk.some((d) => host === d || host.endsWith(`.${d}`));
    if (!dominioOk) return false;
    if (kommoSubdomain) return host.startsWith(`${kommoSubdomain.toLowerCase()}.`);
    return true;
  } catch {
    return false;
  }
}

export const rotuloTemperatura: Record<Temperatura, string> = {
  fria: "Fria",
  morna: "Morna",
  quente: "Quente",
};

export const rotuloEstagio: Record<Estagio, string> = {
  abertura: "Abertura",
  desenvolvimento: "Desenvolvimento",
  ancoragem: "Ancoragem",
  pre_fechamento: "Pré-fechamento",
  handoff: "Handoff",
};

export const rotuloAcao: Record<Acao, string> = {
  conversar: "Conversar",
  passar_preco: "Passar preço",
  encaminhar_humano: "Encaminhar humano",
};

export const rotuloMotivo: Record<string, string> = {
  sinal_fechamento: "Sinal de fechamento",
  troca: "Troca",
  insistencia_preco: "Insistência em preço",
  pedido_humano: "Pedido de humano",
  fora_escopo: "Fora de escopo",
  falha_tecnica: "Falha técnica",
};