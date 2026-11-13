import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BookingAction, BookingOut } from '../../api/types';
import { formatDate, formatDateTime, formatMoney, guestsLabel, nightsLabel } from '../../utils/format';
import { BOOKING_ACTION_LABELS } from '../../utils/labels';
import { RoomPhoto } from '../RoomPhoto';
import { StatusBadge } from '../StatusBadge';
import { BookingDetails } from './BookingDetails';

interface BookingCardProps {
  booking: BookingOut;
  highlighted?: boolean;
  onAction: (action: BookingAction, booking: BookingOut) => void;
}

/** Картка бронювання в особистому кабінеті; кнопки — з allowed_actions. */
export function BookingCard({ booking, highlighted, onAction }: BookingCardProps) {
  const [expanded, setExpanded] = useState(Boolean(highlighted));
  const b = booking;
  const clientActions = b.allowed_actions.filter((a) => a === 'cancel' || a === 'extend');

  return (
    <article className={`booking-card booking-card--${b.status} ${highlighted ? 'booking-card--highlight' : ''}`}>
      <Link to={`/rooms/${b.room.id}`} className="booking-card__photo">
        <RoomPhoto url={b.room.photo_url} alt={b.room.title} label="" />
      </Link>
      <div className="booking-card__body">
        <div className="booking-card__top">
          <div>
            <span className="booking-card__id">Бронювання №{b.id}</span>
            <h3 className="booking-card__title">
              <Link to={`/rooms/${b.room.id}`}>{b.room.title}</Link>
            </h3>
            <span className="muted small">
              {b.room.category_name} · № {b.room.number}
            </span>
          </div>
          <StatusBadge status={b.status} />
        </div>

        <div className="booking-card__facts">
          <div>
            <span>Заїзд</span>
            <strong>{formatDate(b.check_in)}</strong>
          </div>
          <div>
            <span>Виїзд</span>
            <strong>{formatDate(b.check_out)}</strong>
          </div>
          <div>
            <span>Тривалість</span>
            <strong>{nightsLabel(b.nights)}</strong>
          </div>
          <div>
            <span>Гості</span>
            <strong>{guestsLabel(b.guests)}</strong>
          </div>
          <div>
            <span>Сума</span>
            <strong className="booking-card__total">{formatMoney(b.total_price)}</strong>
          </div>
        </div>

        {expanded && <BookingDetails booking={b} />}

        <div className="booking-card__footer">
          <span className="muted small">Створено {formatDateTime(b.created_at)}</span>
          <div className="btn-row">
            <button className="btn btn--ghost btn--sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Сховати деталі' : 'Деталі'}
            </button>
            {clientActions.map((action) => (
              <button
                key={action}
                className={`btn btn--sm ${action === 'cancel' ? 'btn--danger-outline' : 'btn--dark'}`}
                onClick={() => onAction(action, b)}
              >
                {BOOKING_ACTION_LABELS[action]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
