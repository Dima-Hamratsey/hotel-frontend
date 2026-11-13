import type { BookingOut } from '../../api/types';
import { formatMoney, formatNumber, nightsLabel } from '../../utils/format';

/** Фінансова розшифровка бронювання та перелік послуг. */
export function BookingDetails({ booking }: { booking: BookingOut }) {
  const b = booking;
  return (
    <div className="booking-details">
      {b.services.length > 0 && (
        <div className="booking-details__services">
          <h5>Додаткові послуги</h5>
          <table className="mini-table">
            <tbody>
              {b.services.map((s) => (
                <tr key={s.service_id}>
                  <td>{s.name}</td>
                  <td className="num">
                    {s.quantity} × {formatMoney(s.unit_price)}
                  </td>
                  <td className="num">{formatMoney(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <dl className="breakdown">
        <div className="breakdown__row">
          <dt>Проживання, {nightsLabel(b.nights)}</dt>
          <dd>{formatMoney(b.room_cost)}</dd>
        </div>
        {b.services_cost > 0 && (
          <div className="breakdown__row">
            <dt>Послуги</dt>
            <dd>{formatMoney(b.services_cost)}</dd>
          </div>
        )}
        {b.discount > 0 && (
          <div className="breakdown__row breakdown__row--minus">
            <dt>Знижки</dt>
            <dd>−{formatMoney(b.discount)}</dd>
          </div>
        )}
        {b.bonus_used > 0 && (
          <div className="breakdown__row breakdown__row--minus">
            <dt>Оплачено бонусами</dt>
            <dd>−{formatMoney(b.bonus_used)}</dd>
          </div>
        )}
        <div className="breakdown__row breakdown__row--total">
          <dt>Разом</dt>
          <dd>{formatMoney(b.total_price)}</dd>
        </div>
        {b.bonus_earned > 0 && (
          <div className="breakdown__row">
            <dt>Нараховано бонусів</dt>
            <dd className="text-gold">+{formatNumber(b.bonus_earned, 2)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
