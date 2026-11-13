import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminRoute, ProtectedRoute } from './components/RouteGuards';
import { AmenitiesPage } from './pages/admin/AmenitiesPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ServicesAdminPage } from './pages/admin/ServicesAdminPage';
import { CabinetPage } from './pages/cabinet/CabinetPage';
import { LoginPage, RegisterPage } from './pages/public/AuthPages';
import { CatalogPage } from './pages/public/CatalogPage';
import { HomePage } from './pages/public/HomePage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { RoomPage } from './pages/public/RoomPage';
import { ServicesPage } from './pages/public/ServicesPage';

export function App() {
  return (
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
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="amenities" element={<AmenitiesPage />} />
        <Route path="services" element={<ServicesAdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
