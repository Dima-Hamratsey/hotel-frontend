import { bookingsApi } from '../api/bookings';
import type { BookingIn, QuoteOut } from '../api/types';
import { useAsync } from './useAsync';
import { useDebounce } from './useDebounce';

/**
 * Живий розрахунок вартості: POST /api/bookings/quote з debounce.
 * `body = null` означає, що форма ще невалідна — запит не виконується.
 * `sessionKey` змінюється при вході/виході (знижка лояльності залежить від користувача).
 */
export function useQuote(body: BookingIn | null, sessionKey: string | number, delay = 400) {
  const key = body ? JSON.stringify(body) : '';
  const debouncedKey = useDebounce(key, delay);

  const state = useAsync<QuoteOut | null>(
    () => (debouncedKey ? bookingsApi.quote(JSON.parse(debouncedKey) as BookingIn) : Promise.resolve(null)),
    [debouncedKey, sessionKey],
  );

  return { ...state, pending: state.loading || key !== debouncedKey };
}
