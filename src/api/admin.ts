import { http } from './http';
import type {
  AdminBookingAction,
  AdminBookingFilters,
  AdminUserOut,
  AmenityIn,
  AmenityOut,
  BookingOut,
  CategoryIn,
  CategoryOut,
  PhotoOut,
  Role,
  RoomIn,
  RoomOut,
  ServiceIn,
  ServiceOut,
  SettingsOut,
  UserOut,
} from './types';

/**
 * Узагальнений CRUD-ресурс адмін-панелі (однаковий набір операцій для
 * категорій, зручностей, послуг та номерів).
 */
export interface CrudResource<TOut, TIn> {
  list: () => Promise<TOut[]>;
  create: (data: TIn) => Promise<TOut>;
  update: (id: number, data: TIn) => Promise<TOut>;
  remove: (id: number) => Promise<void>;
}

function crud<TOut, TIn>(base: string): CrudResource<TOut, TIn> {
  return {
    list: () => http.get<TOut[]>(base),
    create: (data) => http.post<TOut>(base, data),
    update: (id, data) => http.put<TOut>(`${base}/${id}`, data),
    remove: (id) => http.delete(`${base}/${id}`),
  };
}

export const adminApi = {
  rooms: {
    ...crud<RoomOut, RoomIn>('/api/admin/rooms'),
    uploadPhoto: (roomId: number, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return http.post<PhotoOut>(`/api/admin/rooms/${roomId}/photos`, form);
    },
    deletePhoto: (photoId: number) => http.delete(`/api/admin/photos/${photoId}`),
  },
  categories: crud<CategoryOut, CategoryIn>('/api/admin/categories'),
  amenities: crud<AmenityOut, AmenityIn>('/api/admin/amenities'),
  services: crud<ServiceOut, ServiceIn>('/api/admin/services'),

  bookings: {
    list: (filters: AdminBookingFilters = {}) =>
      http.get<BookingOut[]>('/api/admin/bookings', { ...filters }),
    action: (id: number, action: AdminBookingAction) =>
      http.post<BookingOut>(`/api/admin/bookings/${id}/action`, { action }),
  },

  users: {
    list: () => http.get<AdminUserOut[]>('/api/admin/users'),
    setRole: (id: number, role: Role) => http.put<UserOut>(`/api/admin/users/${id}/role`, { role }),
  },

  settings: {
    get: () => http.get<SettingsOut>('/api/admin/settings'),
    update: (data: SettingsOut) => http.put<SettingsOut>('/api/admin/settings', data),
  },
};
