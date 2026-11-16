import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { Loader } from './components/Loader';
import { AdminRoute, ProtectedRoute } from './components/RouteGuards';
import { CabinetPage } from './pages/cabinet/CabinetPage';
import { LoginPage, RegisterPage } from './pages/public/AuthPages';
import { CatalogPage } from './pages/public/CatalogPage';
import { HomePage } from './pages/public/HomePage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { RoomPage } from './pages/public/RoomPage';
import { ServicesPage } from './pages/public/ServicesPage';

/*
 * Адмін-панель (разом із recharts) завантажується окремим чанком лише для
 * адміністраторів — клієнтська частина лишається легкою.
 */
const AdminLayout = lazy(() => import('./components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const BookingsAdminPage = lazy(() =>
  import('./pages/admin/BookingsAdminPage').then((m) => ({ default: m.BookingsAdminPage })),
);
const UsersAdminPage = lazy(() => import('./pages/admin/UsersAdminPage').then((m) => ({ default: m.UsersAdminPage })));
const RoomsAdminPage = lazy(() => import('./pages/admin/RoomsAdminPage').then((m) => ({ default: m.RoomsAdminPage })));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const AmenitiesPage = lazy(() => import('./pages/admin/AmenitiesPage').then((m) => ({ default: m.AmenitiesPage })));
const ServicesAdminPage = lazy(() =>
  import('./pages/admin/ServicesAdminPage').then((m) => ({ default: m.ServicesAdminPage })),
);
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));

export function App() {
  return (
    <Suspense fallback={<Loader page />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="rooms" element={<CatalogPage />} />
          <Route path="rooms/:id" element={<RoomPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="cabinet"
            element={
              <ProtectedRoute>
                <CabinetPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="bookings" element={<BookingsAdminPage />} />
          <Route path="users" element={<UsersAdminPage />} />
          <Route path="rooms" element={<RoomsAdminPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="amenities" element={<AmenitiesPage />} />
          <Route path="services" element={<ServicesAdminPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
