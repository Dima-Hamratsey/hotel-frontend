/**
 * Поле `icon` зручності — це короткий емодзі або ключове слово.
 * Якщо прийшло ключове слово — підбираємо відповідний емодзі.
 */
const KEYWORD_ICONS: Record<string, string> = {
  wifi: '📶',
  'wi-fi': '📶',
  tv: '📺',
  ac: '❄️',
  air: '❄️',
  conditioner: '❄️',
  snowflake: '❄️',
  minibar: '🍾',
  bar: '🍸',
  safe: '🔒',
  balcony: '🌅',
  view: '🏔️',
  mountain: '🏔️',
  bath: '🛁',
  bathtub: '🛁',
  jacuzzi: '🛁',
  shower: '🚿',
  kitchen: '🍳',
  coffee: '☕',
  parking: '🅿️',
  pet: '🐾',
  desk: '💼',
  work: '💼',
  fireplace: '🔥',
  hairdryer: '💨',
  iron: '🧺',
  kettle: '🫖',
  bed: '🛏️',
};

export function amenityIcon(icon: string | null | undefined): string {
  if (!icon) return '•';
  const key = icon.trim().toLowerCase();
  if (KEYWORD_ICONS[key]) return KEYWORD_ICONS[key];
  // Якщо це вже емодзі (не латинське слово) — повертаємо як є.
  if (!/^[a-z0-9_\- ]+$/i.test(key)) return icon;
  return '•';
}
