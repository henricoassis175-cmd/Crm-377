import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : format(d, "HH:mm", { locale: ptBR });
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

export function fmtNumber(n: number | null | undefined): string {
  return n == null ? "—" : new Intl.NumberFormat("pt-BR").format(n);
}

export function fmtCurrency(n: number | null | undefined, currency = "BRL"): string {
  return n == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(n);
}

export function fmtMs(n: number | null | undefined): string {
  if (n == null) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`;
}

/** Mascara telefone mantendo os 4 últimos dígitos. */
export function maskPhone(v: string | null | undefined): string {
  if (!v) return "—";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 5) return "••••";
  return `•••• ${digits.slice(-4)}`;
}

export function maskEmail(v: string | null | undefined): string {
  if (!v) return "—";
  const [user, domain] = v.split("@");
  if (!user || !domain) return "••••";
  return `${user.slice(0, 2)}•••@${domain}`;
}

export const ROLE_LABEL = {
  admin: "Administrador Vexa",
  gestor: "Administrador da loja",
  operador: "Vendedor",
} as const;

export const TEMPERATURA_LABEL = { fria: "Fria", morna: "Morna", quente: "Quente" } as const;
export const ESTAGIO_LABEL = {
  abertura: "Abertura",
  desenvolvimento: "Desenvolvimento",
  ancoragem: "Ancoragem",
  pre_fechamento: "Pré-fechamento",
  handoff: "Handoff",
} as const;
export const MOTIVO_LABEL = {
  sinal_fechamento: "Sinal de fechamento",
  troca: "Troca",
  insistencia_preco: "Insistência em preço",
  pedido_humano: "Pedido de humano",
  fora_escopo: "Fora de escopo",
  falha_tecnica: "Falha técnica",
} as const;
export const HANDOFF_STATUS_LABEL = {
  pendente: "Pendente",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
} as const;