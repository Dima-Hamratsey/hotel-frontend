import { http } from './http';
import type {
  CategoryPopularity,
  ISODate,
  OccupancyReport,
  RegularClient,
  RevenueReport,
  SummaryReport,
} from './types';

export const reportsApi = {
  summary: () => http.get<SummaryReport>('/api/admin/reports/summary'),
  occupancy: (date_from?: ISODate, date_to?: ISODate) =>
    http.get<OccupancyReport>('/api/admin/reports/occupancy', { date_from, date_to }),
  revenue: (year?: number) => http.get<RevenueReport>('/api/admin/reports/revenue', { year }),
  categories: (date_from?: ISODate, date_to?: ISODate) =>
    http.get<CategoryPopularity[]>('/api/admin/reports/categories', { date_from, date_to }),
  regularClients: (min_bookings = 2) =>
    http.get<RegularClient[]>('/api/admin/reports/regular-clients', { min_bookings }),
};
