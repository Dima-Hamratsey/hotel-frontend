import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/RouteGuards';
import { CabinetPage } from './pages/cabinet/CabinetPage';
import { PublicLayout } from './components/layout/PublicLayout';
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
        <Route path="services" element={<ServicesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
