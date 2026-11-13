import { useState, type FormEvent } from 'react';
import { bookingsApi } from '../../api/bookings';
import { errorMessage } from '../../api/http';
import type { BookingOut } from '../../api/types';
import { addDays, nightsBetween } from '../../utils/dates';
import { formatDate, formatMoney, nightsLabel } from '../../utils/format';
import { Modal } from '../Modal';

interface ExtendBookingModalProps {
  booking: BookingOut | null;
  onClose: () => void;
  onExtended: (updated: BookingOut) => void;
}

/** Продовження проживання: нова дата виїзду → POST /extend → показ нового підсумку. */
export function ExtendBookingModal({ booking, onClose, onExtended }: ExtendBookingModalProps) {
  return (
    <Modal open={Boolean(booking)} title="Продовжити проживання" onClose={onClose} size="sm">
      {booking && <ExtendForm key={booking.id} booking={booking} onClose={onClose} onExtended={onExtended} />}
    </Modal>
  );
}

function ExtendForm({ booking, onClose, onExtended }: { booking: BookingOut; onClose: () => void; onExtended: (b: BookingOut) => void }) {
  const minDate = addDays(booking.check_out, 1);
  const [newCheckOut, setNewCheckOut] = useState(minDate);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingOut | null>(null);

  const extraNights = nightsBetween(booking.check_out, newCheckOut);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const updated = await bookingsApi.extend(booking.id, newCheckOut);
      setResult(updated);
      onExtended(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  if (result) {
    const diff = result.total_price - booking.total_price;
    return (
      <div className="extend-result">
        <div className="extend-result__icon">✓</div>
        <h4>Проживання продовжено</h4>
        <p className="muted">
          Новий виїзд: <strong>{formatDate(result.check_out)}</strong> · всього {nightsLabel(result.nights)}
        </p>
        <dl className="breakdown">
          <div className="breakdown__row">
            <dt>Попередня сума</dt>
            <dd>{formatMoney(booking.total_price)}</dd>
          </div>
          <div className="breakdown__row">
            <dt>Доплата</dt>
            <dd>+{formatMoney(diff)}</dd>
          </div>
          <div className="breakdown__row breakdown__row--total">
            <dt>Новий підсумок</dt>
            <dd>{formatMoney(result.total_price)}</dd>
          </div>
        </dl>
        <div className="form-actions">
          <button className="btn btn--dark" onClick={onClose}>
            Готово
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="muted">
        {booking.room.title} (№ {booking.room.number}). Поточне проживання: {formatDate(booking.check_in)} —{' '}
        {formatDate(booking.check_out)}.
      </p>
      <div className="field">
        <label htmlFor="extend-date">Нова дата виїзду</label>
        <input
          id="extend-date"
          type="date"
          className="input"
          required
          min={minDate}
          value={newCheckOut}
          onChange={(e) => setNewCheckOut(e.target.value)}
        />
        {extraNights > 0 && <span className="field__hint">Додатково: {nightsLabel(extraNights)}. Вартість буде перераховано з тими самими послугами.</span>}
      </div>
      {error && (
        <div className="alert alert--error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn--outline" onClick={onClose} disabled={pending}>
          Відмінити
        </button>
        <button type="submit" className="btn btn--dark" disabled={pending || extraNights <= 0}>
          {pending ? 'Зачекайте…' : 'Продовжити'}
        </button>
      </div>
    </form>
  );
}
