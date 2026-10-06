// Validação de URLs de retorno/webhook. Nunca chamar URLs arbitrárias recebidas do cliente.
const KOMMO_HOST_SUFFIXES = [".kommo.com", ".amocrm.com", ".amocrm.ru"];

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isAllowedKommoUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return false;
    const host = u.hostname.toLowerCase();
    return KOMMO_HOST_SUFFIXES.some((s) => host.endsWith(s) && host.length > s.length);
  } catch {
    return false;
  }
}