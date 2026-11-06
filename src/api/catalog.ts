import { http } from './http';
import type { AmenityOut, BusyRange, CategoryOut, ISODate, RoomFilters, RoomOut, ServiceOut } from './types';

/** Публічні ендпоінти каталогу. */
export const catalogApi = {
  categories: () => http.get<CategoryOut[]>('/api/categories'),
  amenities: () => http.get<AmenityOut[]>('/api/amenities'),
  services: () => http.get<ServiceOut[]>('/api/services'),
};

export const roomsApi = {
  list: (filters: RoomFilters = {}, signal?: AbortSignal) =>
    http.get<RoomOut[]>('/api/rooms', { ...filters }, signal),
  get: (id: number) => http.get<RoomOut>(`/api/rooms/${id}`),
  availability: (id: number, check_in: ISODate, check_out: ISODate) =>
    http.get<{ available: boolean }>(`/api/rooms/${id}/availability`, { check_in, check_out }),
  busyDates: (id: number) => http.get<BusyRange[]>(`/api/rooms/${id}/busy-dates`),
};
