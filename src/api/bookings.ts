import { http } from './http';
import type { BonusesOut, BookingIn, BookingOut, ISODate, QuoteOut } from './types';

export const bookingsApi = {
  quote: (data: BookingIn) => http.post<QuoteOut>('/api/bookings/quote', data),
  create: (data: BookingIn) => http.post<BookingOut>('/api/bookings', data),
  my: () => http.get<BookingOut[]>('/api/bookings/my'),
  get: (id: number) => http.get<BookingOut>(`/api/bookings/${id}`),
  cancel: (id: number) => http.post<BookingOut>(`/api/bookings/${id}/cancel`),
  extend: (id: number, new_check_out: ISODate) =>
    http.post<BookingOut>(`/api/bookings/${id}/extend`, { new_check_out }),
};

export const bonusesApi = {
  my: () => http.get<BonusesOut>('/api/bonuses/my'),
};
