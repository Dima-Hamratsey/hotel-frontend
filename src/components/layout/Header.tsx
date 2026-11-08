import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HOTEL_SHORT_NAME } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { LoyaltyBadge } from '../StatusBadge';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { to: '/', label: 'Головна', end: true },
  { to: '/rooms', label: 'Номери', end: false },
  { to: '/services', label: 'Послуги', end: false },
];

export function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Закриваємо мобільне меню при переході.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={HOTEL_SHORT_NAME}>
          <Logo />
          <span className="brand__text">
            <span className="brand__kicker">Готель</span>
            <span className="brand__name">{HOTEL_SHORT_NAME}</span>
          </span>
        </Link>

        <button
          className={`burger ${menuOpen ? 'burger--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? 'site-nav--open' : ''}`}>
          <ul className="site-nav__links">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="site-nav__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
            {user && (
              <li>
                <NavLink to="/cabinet" className="site-nav__link">
                  Кабінет
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li>
                <NavLink to="/admin" className="site-nav__link site-nav__link--admin">
                  Адмін-панель
                </NavLink>
              </li>
            )}
          </ul>

          <div className="site-nav__auth">
            {user ? (
              <>
                <Link to="/cabinet" className="user-chip" title={user.email}>
                  <span className="user-chip__avatar">{user.full_name.trim().charAt(0).toUpperCase()}</span>
                  <span className="user-chip__info">
                    <span className="user-chip__name">{user.full_name}</span>
                    {user.role === 'client' && <LoyaltyBadge level={user.loyalty_level} />}
                  </span>
                </Link>
                <button className="btn btn--outline btn--sm site-nav__logout" onClick={handleLogout}>
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" state={{ from: location.pathname + location.search }} className="btn btn--ghost btn--sm">
                  Увійти
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm">
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
