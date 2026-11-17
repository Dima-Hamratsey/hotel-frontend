import { Link } from 'react-router-dom';
import { HOTEL_ADDRESS, HOTEL_EMAIL, HOTEL_NAME, HOTEL_PHONE } from '../../config';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo size={44} />
          <div>
            <strong>{HOTEL_NAME}</strong>
            <p>Затишний готель на березі Чорного моря: комфортні номери, SPA та гостинність, до якої хочеться повертатися.</p>
          </div>
        </div>
        <div>
          <h4>Гостям</h4>
          <ul>
            <li>
              <Link to="/rooms">Каталог номерів</Link>
            </li>
            <li>
              <Link to="/services">Додаткові послуги</Link>
            </li>
            <li>
              <Link to="/cabinet">Особистий кабінет</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Контакти</h4>
          <ul>
            <li>{HOTEL_ADDRESS}</li>
            <li>{HOTEL_PHONE}</li>
            <li>{HOTEL_EMAIL}</li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="container">© {new Date().getFullYear()} {HOTEL_NAME}. Курсовий проєкт «Система управління готелем».</div>
      </div>
    </footer>
  );
}
