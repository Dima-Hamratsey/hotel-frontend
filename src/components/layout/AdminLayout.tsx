import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HOTEL_SHORT_NAME } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';
import { Logo } from './Logo';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const NAV_GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Аналітика',
    items: [
      { to: '/admin', label: 'Дашборд', icon: '◧', end: true },
      { to: '/admin/reports', label: 'Звіти', icon: '📈' },
    ],
  },
  {
    title: 'Операції',
    items: [
      { to: '/admin/bookings', label: 'Бронювання', icon: '🗓️' },
      { to: '/admin/users', label: 'Користувачі', icon: '👥' },
    ],
  },
  {
    title: 'Каталог',
    items: [
      { to: '/admin/rooms', label: 'Номери', icon: '🛏️' },
      { to: '/admin/categories', label: 'Категорії', icon: '🏷️' },
      { to: '/admin/amenities', label: 'Зручності', icon: '📶' },
      { to: '/admin/services', label: 'Послуги', icon: '✨' },
    ],
  },
  {
    title: 'Система',
    items: [{ to: '/admin/settings', label: 'Налаштування', icon: '⚙️' }],
  },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <button className={`burger ${open ? 'burger--open' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Меню">
          <span />
          <span />
          <span />
        </button>
        <span className="admin-topbar__title">Адмін-панель</span>
      </div>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}>
        <Link to="/admin" className="brand">
          <Logo size={36} />
          <span className="brand__text">
            <span className="brand__kicker">Адмін-панель</span>
            <span className="brand__name">{HOTEL_SHORT_NAME}</span>
          </span>
        </Link>

        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="admin-sidebar__group">{group.title}</div>
            <nav className="admin-sidebar__nav">
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="admin-sidebar__link">
                  <span className="admin-sidebar__icon" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        <div className="admin-sidebar__footer">
          {user && (
            <div className="admin-sidebar__user">
              <strong>{user.full_name}</strong>
              {user.email}
            </div>
          )}
          <Link to="/" className="admin-sidebar__link">
            <span className="admin-sidebar__icon">↗</span>
            На сайт
          </Link>
          <button
            className="admin-sidebar__link link-reset"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <span className="admin-sidebar__icon">⎋</span>
            Вийти
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
