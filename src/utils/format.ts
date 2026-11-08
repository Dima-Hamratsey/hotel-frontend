const moneyFormatter = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** 1250 → «1 250 ₴» */
export function formatMoney(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  // Intl uk-UA використовує нерозривний пробіл як роздільник тисяч — він коректно не переноситься.
  return `${moneyFormatter.format(n)} ₴`;
}

/** Число з роздільниками без валюти. */
export function formatNumber(value: number | null | undefined, digits = 0): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: digits }).format(Number(value ?? 0));
}

/** 0.734 → «73,4 %» */
export function formatPercent(rate: number | null | undefined, digits = 1): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'percent',
    maximumFractionDigits: digits,
  }).format(Number(rate ?? 0));
}

/** Розбирає YYYY-MM-DD як локальну дату (без зсуву часового поясу). */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return dateFormatter.format(value.length <= 10 ? parseISODate(value) : new Date(value));
}

export function formatLongDate(value: string | null | undefined): string {
  if (!value) return '—';
  return longDateFormatter.format(parseISODate(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return dateTimeFormatter.format(new Date(value));
}

/** Українська множина: plural(3, ['ніч', 'ночі', 'ночей']) → «ночі». */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export const nightsLabel = (n: number) => `${n} ${plural(n, ['ніч', 'ночі', 'ночей'])}`;
export const guestsLabel = (n: number) => `${n} ${plural(n, ['гість', 'гості', 'гостей'])}`;
