/**
 * Типи, що дзеркально відображають схеми API-контракту (API_CONTRACT.md).
 * Назви полів збігаються з бекендом один в один.
 */

export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // ISO 8601

export type Role = 'client' | 'admin';
export type LoyaltyLevel = 'none' | 'silver' | 'gold';

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  bonus_points: number;
  loyalty_level: LoyaltyLevel;
  created_at: ISODateTime;
}

export interface TokenOut {
  access_token: string;
  token_type: 'bearer';
  user: UserOut;
}

export interface LoginIn {
  email: string;
  password: string;
}

export interface RegisterIn extends LoginIn {
  full_name: string;
  phone?: string | null;
}

export interface CategoryOut {
  id: number;
  code: 'economy' | 'standard' | 'lux' | string;
  name: string;
  description: string;
  base_price: number;
}

export type CategoryIn = Omit<CategoryOut, 'id'>;

export interface AmenityOut {
  id: number;
  name: string;
  icon: string;
}

export type AmenityIn = Omit<AmenityOut, 'id'>;

export interface PhotoOut {
  id: number;
  url: string;
}

export type ServiceType = 'meal' | 'transfer' | 'spa' | 'other';
export type PricingType = 'per_stay' | 'per_night' | 'per_person_per_night';

export interface ServiceOut {
  id: number;
  code: string;
  name: string;
  description: string;
  type: ServiceType;
  price: number;
  pricing_type: PricingType;
  is_active: boolean;
}

export type ServiceIn = Omit<ServiceOut, 'id'>;

export interface RoomOut {
  id: number;
  number: string;
  title: string;
  description: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  is_active: boolean;
  category: CategoryOut;
  amenities: AmenityOut[];
  photos: PhotoOut[];
}

export interface RoomIn {
  number: string;
  title: string;
  description: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  category_id: number;
  amenity_ids: number[];
  is_active: boolean;
}

export interface RoomShort {
  id: number;
  number: string;
  title: string;
  category_name: string;
  photo_url: string | null;
}

export type RoomSort = 'price_asc' | 'price_desc' | 'capacity';

export interface RoomFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  guests?: number;
  amenities?: number[];
  check_in?: ISODate;
  check_out?: ISODate;
  sort?: RoomSort;
}

export interface BusyRange {
  check_in: ISODate;
  check_out: ISODate;
}

export interface BookingServiceOut {
  service_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface BreakdownLine {
  label: string;
  amount: number;
}

export interface QuoteOut {
  nights: number;
  room_cost: number;
  services: BookingServiceOut[];
  services_cost: number;
  discount: number;
  bonus_used: number;
  total: number;
  bonus_to_earn: number;
  breakdown: BreakdownLine[];
}

export interface BookingServiceIn {
  service_id: number;
  quantity: number;
}

export interface BookingIn {
  room_id: number;
  check_in: ISODate;
  check_out: ISODate;
  guests: number;
  services: BookingServiceIn[];
  use_bonus_points: number;
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type BookingAction = 'cancel' | 'extend' | 'check_in' | 'complete';

export interface BookingUser {
  id: number;
  full_name: string;
  email: string;
}

export interface BookingOut {
  id: number;
  room: RoomShort;
  user: BookingUser;
  check_in: ISODate;
  check_out: ISODate;
  guests: number;
  nights: number;
  status: BookingStatus;
  room_cost: number;
  services_cost: number;
  discount: number;
  bonus_used: number;
  bonus_earned: number;
  total_price: number;
  services: BookingServiceOut[];
  created_at: ISODateTime;
  allowed_actions: BookingAction[];
}

export interface BonusTxOut {
  id: number;
  amount: number;
  reason: string;
  booking_id: number | null;
  created_at: ISODateTime;
}

export interface BonusesOut {
  balance: number;
  loyalty_level: LoyaltyLevel;
  completed_stays: number;
  transactions: BonusTxOut[];
}

export interface SettingsOut {
  hotel_name: string;
  bonus_percent: number;
  bonus_max_share_percent: number;
  weekend_markup_percent: number;
  long_stay_nights: number;
  long_stay_discount_percent: number;
  silver_min_stays: number;
  silver_discount_percent: number;
  gold_min_stays: number;
  gold_discount_percent: number;
}

export interface AdminUserOut extends UserOut {
  bookings_count: number;
  total_spent: number;
}

export type AdminBookingAction = Exclude<BookingAction, 'extend'>;

export interface AdminBookingFilters {
  status?: BookingStatus;
  date_from?: ISODate;
  date_to?: ISODate;
}

/* ---------- Звіти ---------- */

export interface SummaryReport {
  rooms_total: number;
  occupied_today: number;
  active_bookings: number;
  revenue_this_month: number;
  clients_total: number;
  occupancy_rate_today: number;
}

export interface OccupancyByRoom {
  room_id: number;
  number: string;
  category: string;
  booked_nights: number;
  available_nights: number;
  rate: number;
}

export interface OccupancyByDay {
  date: ISODate;
  occupied: number;
  rate: number;
}

export interface OccupancyReport {
  date_from: ISODate;
  date_to: ISODate;
  total_rooms: number;
  overall_rate: number;
  by_room: OccupancyByRoom[];
  by_day: OccupancyByDay[];
}

export interface RevenueMonth {
  month: number;
  revenue: number;
  bookings: number;
}

export interface RevenueReport {
  year: number;
  total: number;
  months: RevenueMonth[];
}

export interface CategoryPopularity {
  category_id: number;
  name: string;
  bookings: number;
  nights: number;
  revenue: number;
  share: number;
}

export interface RegularClient {
  user_id: number;
  full_name: string;
  email: string;
  bookings: number;
  nights: number;
  total_spent: number;
  bonus_points: number;
  loyalty_level: LoyaltyLevel;
  last_stay: ISODate | null;
}
