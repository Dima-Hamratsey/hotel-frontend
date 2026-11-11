import type { RoomFilters, RoomSort } from '../api/types';

const SORTS: RoomSort[] = ['price_asc', 'price_desc', 'capacity'];

function num(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** URL ?category_id=1&amenities=2,3… → RoomFilters */
export function filtersFromSearch(params: URLSearchParams): RoomFilters {
  const sort = params.get('sort') as RoomSort | null;
  const amenities = (params.get('amenities') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  return {
    category_id: num(params.get('category_id')),
    min_price: num(params.get('min_price')),
    max_price: num(params.get('max_price')),
    guests: num(params.get('guests')),
    amenities: amenities.length ? amenities : undefined,
    check_in: params.get('check_in') || undefined,
    check_out: params.get('check_out') || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
  };
}

/** RoomFilters → URLSearchParams (порожні значення пропускаються). */
export function filtersToSearch(filters: RoomFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}

/**
 * Готує фільтри до запиту: дати передаються лише парою і коли виїзд пізніше заїзду
 * (інакше бекенд не зможе перевірити доступність).
 */
export function normalizeFilters(filters: RoomFilters): RoomFilters {
  const result = { ...filters };
  const validDates = result.check_in && result.check_out && result.check_out > result.check_in;
  if (!validDates) {
    delete result.check_in;
    delete result.check_out;
  }
  return result;
}

/** Параметри, які переносяться з каталогу на сторінку номера (дати та гості). */
export function bookingSearch(filters: RoomFilters): string {
  const params = new URLSearchParams();
  if (filters.check_in && filters.check_out && filters.check_out > filters.check_in) {
    params.set('check_in', filters.check_in);
    params.set('check_out', filters.check_out);
  }
  if (filters.guests) params.set('guests', String(filters.guests));
  const s = params.toString();
  return s ? `?${s}` : '';
}
