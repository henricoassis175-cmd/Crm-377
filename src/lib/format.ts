export function formatBRL(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseBRLToCents(valor: string): number {
  const bruto = valor.replace(/[^\d,.-]/g, "");
  // Formato "1234.56" (CSV/planilha): ponto é separador decimal.
  const limpo = /^-?\d+\.\d{1,2}$/.test(bruto)
    ? bruto
    : bruto.replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}


export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Mascara PII em textos exibidos em logs e auditoria. */
export function maskPII(texto: string | null | undefined): string {
  if (!texto) return "—";
  return texto
    .replace(/([\w.+-]{1,3})[\w.+-]*@([\w-]+\.)+\w+/g, "$1***@***")
    .replace(/\+?\d{2}?\s?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/g, (m) => `***${m.slice(-2)}`)
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "***.***.***-**");
}

export function maskName(nome: string | null | undefined): string {
  if (!nome) return "—";
  const partes = nome.trim().split(/\s+/);
  return partes.map((p, i) => (i === 0 ? p : `${p[0] ?? ""}.`)).join(" ");
}