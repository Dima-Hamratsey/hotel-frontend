/**
 * Кольори для графіків. Категоріальна палітра у фіксованому порядку
 * (перевірена на розрізнюваність для дальтоніків); колір закріплюється за
 * сутністю (id категорії), а не за її позицією в рейтингу.
 */
export const CATEGORICAL = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];

/** Одна серія — один фірмовий колір. */
export const SERIES_PRIMARY = '#1f2f52';
export const SERIES_ACCENT = '#c9a24b';

export const AXIS_COLOR = '#8a91a0';
export const GRID_COLOR = '#ece7dc';

export function colorForId(id: number, orderedIds: number[]): string {
  const idx = [...orderedIds].sort((a, b) => a - b).indexOf(id);
  return CATEGORICAL[(idx >= 0 ? idx : 0) % CATEGORICAL.length];
}
