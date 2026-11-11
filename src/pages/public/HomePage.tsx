import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogApi } from '../../api/catalog';
import type { CategoryOut } from '../../api/types';
import { DateRange } from '../../components/DateRange';
import { ServicesList } from '../../components/ServicesList';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { addDays, todayISO } from '../../utils/dates';
import { formatMoney } from '../../utils/format';
import { filtersToSearch } from '../../utils/roomFilters';

const CATEGORY_VISUALS: Record<string, { icon: string; tagline: string }> = {
  economy: { icon: '🌲', tagline: 'Практичний комфорт для мандрівників' },
  standard: { icon: '🏔️', tagline: 'Простір і краєвиди для відпочинку' },
  lux: { icon: '👑', tagline: 'Апартаменти преміум-класу' },
};

const FEATURES = [
  { icon: '🏔️', title: 'Панорамні краєвиди', text: 'Вікна на Карпатські хребти та хвойний ліс у кожному номері категорії «Стандарт» і вище.' },
  { icon: '💆', title: 'SPA та релакс', text: 'Чан, сауна, масажі та трав’яні ритуали — для повного перезавантаження.' },
  { icon: '🍽️', title: 'Гуцульська кухня', text: 'Сніданки з локальних продуктів і вечері від шеф-кухаря.' },
  { icon: '🎁', title: 'Бонусна програма', text: 'Отримуйте бонуси за кожне проживання та знижки для постійних гостей.' },
];

function CategoryCard({ category }: { category: CategoryOut }) {
  const visual = CATEGORY_VISUALS[category.code] ?? { icon: '🛏️', tagline: '' };
  return (
    <Link to={`/rooms?category_id=${category.id}`} className={`category-card category-card--${category.code}`}>
      <span className="category-card__icon" aria-hidden>
        {visual.icon}
      </span>
      <span className="category-card__tagline">{visual.tagline}</span>
      <h3 className="category-card__name">{category.name}</h3>
      <p className="category-card__desc">{category.description}</p>
      <span className="category-card__price">
        від <strong>{formatMoney(category.base_price)}</strong> / ніч
      </span>
      <span className="category-card__cta">Переглянути номери →</span>
    </Link>
  );
}

export function HomePage() {
  useDocumentTitle();
  const navigate = useNavigate();
  const today = todayISO();
  const [range, setRange] = useState({ checkIn: addDays(today, 1), checkOut: addDays(today, 3) });
  const [guests, setGuests] = useState(2);
  const categories = useAsync(() => catalogApi.categories(), []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = filtersToSearch({ check_in: range.checkIn, check_out: range.checkOut, guests });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden>
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0 240 L180 120 L300 200 L470 60 L640 210 L760 140 L920 230 L1080 90 L1260 200 L1440 130 L1440 320 L0 320 Z" fill="rgba(201,162,75,0.10)" />
            <path d="M0 280 L140 200 L320 260 L520 150 L700 270 L880 190 L1040 260 L1220 170 L1440 250 L1440 320 L0 320 Z" fill="rgba(11,20,38,0.55)" />
          </svg>
        </div>
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="eyebrow">Яремче · Карпати</span>
            <h1 className="hero__title">
              Відпочинок серед гір,
              <br />
              де час сповільнюється
            </h1>
            <p className="hero__lead">
              Затишні номери, гуцульська гостинність, SPA та сніданки з видом на хребти. Бронюйте онлайн за кілька хвилин
              і накопичуйте бонуси за кожне проживання.
            </p>
            <div className="hero__stats">
              <div>
                <strong>4.9</strong>
                <span>рейтинг гостей</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>рецепція</span>
              </div>
              <div>
                <strong>−10%</strong>
                <span>постійним гостям</span>
              </div>
            </div>
          </div>

          <form className="search-card" onSubmit={handleSearch}>
            <h2 className="search-card__title">Знайти номер</h2>
            <DateRange
              checkIn={range.checkIn}
              checkOut={range.checkOut}
              min={today}
              required
              onChange={setRange}
            />
            <div className="field">
              <label htmlFor="hero-guests">Гості</label>
              <select
                id="hero-guests"
                className="select"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'гість' : n < 5 ? 'гості' : 'гостей'}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--primary btn--lg btn--block">
              Перевірити наявність
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Номери</span>
              <h2>Оберіть свою категорію</h2>
            </div>
            <p>Від затишного економ-номера до просторого люксу з каміном — кожен знайде свій ідеальний відпочинок.</p>
          </div>
          {categories.error ? (
            <div className="alert alert--error">{categories.error}</div>
          ) : (
            <div className="category-grid">
              {(categories.data ?? []).map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
              {categories.loading &&
                !categories.data &&
                [0, 1, 2].map((i) => <div key={i} className="category-card category-card--skeleton" />)}
            </div>
          )}
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature">
                <span className="feature__icon" aria-hidden>
                  {f.icon}
                </span>
                <h4>{f.title}</h4>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Додаткові послуги</span>
              <h2>Зробіть перебування особливим</h2>
            </div>
            <p>Харчування, трансфер та SPA можна додати під час бронювання — вартість одразу врахується в розрахунку.</p>
          </div>
          <ServicesList />
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band__inner">
          <div>
            <h2>Готові до подорожі в Карпати?</h2>
            <p>Зареєструйтеся, щоб накопичувати бонуси та отримувати знижки постійного гостя.</p>
          </div>
          <div className="btn-row">
            <Link to="/rooms" className="btn btn--primary btn--lg">
              Каталог номерів
            </Link>
            <Link to="/register" className="btn btn--outline btn--lg cta-band__outline">
              Створити акаунт
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
