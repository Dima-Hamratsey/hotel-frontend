import type {
  BookingAction,
  BookingStatus,
  LoyaltyLevel,
  PricingType,
  Role,
  RoomSort,
  ServiceType,
} from '../api/types';

/** Українські підписи для enum-значень контракту. */

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Підтверджено',
  checked_in: 'Заселено',
  completed: 'Завершено',
  cancelled: 'Скасовано',
};

export const BOOKING_ACTION_LABELS: Record<BookingAction, string> = {
  cancel: 'Скасувати',
  extend: 'Продовжити',
  check_in: 'Заселити',
  complete: 'Завершити',
};

export const LOYALTY_LABELS: Record<LoyaltyLevel, string> = {
  none: 'Базовий',
  silver: 'Срібний',
  gold: 'Золотий',
};

export const ROLE_LABELS: Record<Role, string> = {
  client: 'Клієнт',
  admin: 'Адміністратор',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  meal: 'Харчування',
  transfer: 'Трансфер',
  spa: 'SPA',
  other: 'Інше',
};

export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  meal: '🍽️',
  transfer: '🚘',
  spa: '💆',
  other: '✨',
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  per_stay: 'за перебування',
  per_night: 'за ніч',
  per_person_per_night: 'за особу за ніч',
};

export const SORT_LABELS: Record<RoomSort, string> = {
  price_asc: 'Ціна: від дешевших',
  price_desc: 'Ціна: від дорожчих',
  capacity: 'За місткістю',
};

export const MONTH_LABELS = [
  'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
];

export const MONTH_FULL_LABELS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];
