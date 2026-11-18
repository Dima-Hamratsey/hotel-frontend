import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../api/bookings';
import { errorMessage } from '../../api/http';
import type { BookingIn, BusyRange, RoomOut, ServiceOut } from '../../api/types';
import { useAuth } from '../../hooks/useAuth';
import { useQuote } from '../../hooks/useQuote';
import { useToast } from '../../hooks/useToast';
import { findOverlap, nightsBetween, todayISO } from '../../utils/dates';
import { formatDate, formatMoney, formatNumber, nightsLabel } from '../../utils/format';
import { DateRange } from '../DateRange';
import { Loader } from '../Loader';
import { PriceBreakdown } from '../PriceBreakdown';
import { LoyaltyBadge } from '../StatusBadge';
import { ServicePicker, type ServiceSelection } from './ServicePicker';

/** Обмеження бекенду на тривалість одного бронювання. */
const MAX_NIGHTS = 90;

interface BookingPanelProps {
  room: RoomOut;
  services: ServiceOut[];
  busy: BusyRange[];
  checkIn: string;
  checkOut: string;
  guests: number;
  /** Дати та гості синхронізуються з URL, щоб пережити редирект на вхід. */
  onParamsChange: (p: { checkIn: string; checkOut: string; guests: number }) => void;
}

export function BookingPanel({ room, services, busy, checkIn, checkOut, guests, onParamsChange }: BookingPanelProps) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [selection, setSelection] = useState<ServiceSelection>({});
  const [bonusInput, setBonusInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = todayISO();
  const nights = nightsBetween(checkIn, checkOut);
  const balance = user?.bonus_points ?? 0;
  const bonus = Math.max(0, Math.min(Number(bonusInput) || 0, balance));

  // Клієнтська валідація перед запитом розрахунку.
  const validationError = useMemo(() => {
    if (!checkIn || !checkOut) return 'Оберіть дати заїзду та виїзду';
    if (checkIn < today) return 'Дата заїзду не може бути в минулому';
    if (nights <= 0) return 'Дата виїзду має бути пізніше дати заїзду';
    if (nights > MAX_NIGHTS) return `Максимальна тривалість бронювання — ${MAX_NIGHTS} ночей`;
    if (guests < 1) return 'Вкажіть кількість гостей';
    if (guests > room.capacity) return `Номер розрахований максимум на ${room.capacity} гостей`;
    const overlap = findOverlap({ check_in: checkIn, check_out: checkOut }, busy);
    if (overlap) {
      return `Номер зайнятий з ${formatDate(overlap.check_in)} по ${formatDate(overlap.check_out)}. Оберіть інші дати.`;
    }
    return null;
  }, [checkIn, checkOut, today, nights, guests, room.capacity, busy]);

  const body: BookingIn | null = validationError
    ? null
    : {
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        services: Object.entries(selection).map(([id, quantity]) => ({ service_id: Number(id), quantity })),
        use_bonus_points: user ? bonus : 0,
      };

  const quote = useQuote(body, user?.id ?? 'guest');

  const handleBook = async () => {
    if (!body) return;
    if (!user) {
      toast.notify('Увійдіть або зареєструйтеся, щоб завершити бронювання');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await bookingsApi.create(body);
      await refreshUser();
      toast.success(`Бронювання №${booking.id} підтверджено!`);
      navigate('/cabinet', { state: { highlightBooking: booking.id } });
    } catch (err) {
      setSubmitError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-panel">
      <div className="booking-panel__price">
        <strong>{formatMoney(room.price_per_night)}</strong> <span>/ ніч</span>
      </div>

      <DateRange
        checkIn={checkIn}
        checkOut={checkOut}
        min={today}
        onChange={(r) => onParamsChange({ ...r, guests })}
      />

      <div className="field">
        <label htmlFor="bp-guests">Гості</label>
        <select
          id="bp-guests"
          className="select"
          value={guests}
          onChange={(e) => onParamsChange({ checkIn, checkOut, guests: Number(e.target.value) })}
        >
          {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {services.length > 0 && (
        <details className="booking-panel__services" open>
          <summary>
            Додаткові послуги
            {Object.keys(selection).length > 0 && <span className="tag">{Object.keys(selection).length}</span>}
          </summary>
          <ServicePicker services={services} value={selection} onChange={setSelection} />
        </details>
      )}

      {user ? (
        <div className="bonus-box">
          <div className="bonus-box__head">
            <span>
              Ваш баланс: <strong>{formatNumber(balance, 2)} бонусів</strong>
            </span>
            <LoyaltyBadge level={user.loyalty_level} />
          </div>
          <div className="bonus-box__row">
            <input
              className="input"
              type="number"
              min={0}
              max={balance}
              step={1}
              placeholder="Скільки бонусів списати"
              value={bonusInput}
              disabled={balance <= 0}
              onChange={(e) => setBonusInput(e.target.value)}
              aria-label="Списати бонуси"
            />
            <button
              type="button"
              className="btn btn--outline btn--sm"
              disabled={balance <= 0}
              onClick={() => setBonusInput(String(Math.floor(balance)))}
            >
              Максимум
            </button>
          </div>
          <p className="field__hint">1 бонус = 1 ₴. Частка оплати бонусами обмежена правилами програми лояльності.</p>
        </div>
      ) : (
        <p className="booking-panel__note">Увійдіть, щоб отримати знижку постійного гостя та оплатити частину вартості бонусами.</p>
      )}

      <div className="booking-panel__quote">
        {validationError ? (
          <div className="alert alert--warning">{validationError}</div>
        ) : quote.error ? (
          <div className="alert alert--error">{quote.error}</div>
        ) : quote.data ? (
          <div className={quote.pending ? 'is-updating' : ''}>
            <div className="booking-panel__nights">
              {formatDate(checkIn)} — {formatDate(checkOut)} · {nightsLabel(quote.data.nights)}
              {quote.pending && <Loader inline />}
            </div>
            <PriceBreakdown lines={quote.data.breakdown} total={quote.data.total} />
            {quote.data.bonus_to_earn > 0 && (
              <div className="earn-note">
                 Після проживання ви отримаєте <strong>{formatNumber(quote.data.bonus_to_earn, 2)}</strong> бонусів
              </div>
            )}
          </div>
        ) : (
          <Loader label="Розраховуємо вартість…" />
        )}
      </div>

      {submitError && <div className="alert alert--error">{submitError}</div>}

      <button
        className="btn btn--primary btn--lg btn--block"
        disabled={Boolean(validationError) || Boolean(quote.error) || submitting || !quote.data || quote.pending}
        onClick={handleBook}
      >
        {submitting ? 'Бронюємо…' : user ? 'Забронювати' : 'Увійти та забронювати'}
      </button>
    </div>
  );
}
