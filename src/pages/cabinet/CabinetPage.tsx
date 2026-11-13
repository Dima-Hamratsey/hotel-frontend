import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bonusesApi, bookingsApi } from '../../api/bookings';
import type { BookingAction, BookingOut, BookingStatus } from '../../api/types';
import { AsyncContent } from '../../components/AsyncContent';
import { BookingCard } from '../../components/booking/BookingCard';
import { ExtendBookingModal } from '../../components/booking/ExtendBookingModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { LoyaltyBadge } from '../../components/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, formatDateTime, formatMoney, formatNumber } from '../../utils/format';
import { BOOKING_STATUS_LABELS, ROLE_LABELS } from '../../utils/labels';

type Tab = 'bookings' | 'bonuses' | 'profile';
type StatusFilter = 'all' | BookingStatus;

export function CabinetPage() {
  useDocumentTitle('Особистий кабінет');
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const highlightId = (location.state as { highlightBooking?: number } | null)?.highlightBooking;

  const [tab, setTab] = useState<Tab>('bookings');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toCancel, setToCancel] = useState<BookingOut | null>(null);
  const [toExtend, setToExtend] = useState<BookingOut | null>(null);

  const bookings = useAsync(() => bookingsApi.my(), []);
  const bonuses = useAsync(() => bonusesApi.my(), []);
  const cancelAction = useAsyncAction();

  const replaceBooking = (updated: BookingOut) =>
    bookings.setData((list) => (list ?? []).map((b) => (b.id === updated.id ? updated : b)));

  const handleAction = (action: BookingAction, booking: BookingOut) => {
    if (action === 'cancel') setToCancel(booking);
    if (action === 'extend') setToExtend(booking);
  };

  const confirmCancel = async () => {
    if (!toCancel) return;
    const updated = await cancelAction.run(() => bookingsApi.cancel(toCancel.id), `Бронювання №${toCancel.id} скасовано`);
    if (updated) {
      replaceBooking(updated);
      bonuses.reload(); // повернення списаних бонусів
      void refreshUser();
    }
    setToCancel(null);
  };

  const filtered = useMemo(
    () => (bookings.data ?? []).filter((b) => statusFilter === 'all' || b.status === statusFilter),
    [bookings.data, statusFilter],
  );

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: 0, confirmed: 0, checked_in: 0, completed: 0, cancelled: 0 };
    for (const b of bookings.data ?? []) {
      c.all += 1;
      c[b.status] += 1;
    }
    return c;
  }, [bookings.data]);

  if (!user) return null;

  const balance = bonuses.data?.balance ?? user.bonus_points;
  const level = bonuses.data?.loyalty_level ?? user.loyalty_level;

  return (
    <div className="page cabinet">
      <div className="container">
        <section className="cabinet-hero">
          <div className="cabinet-hero__profile">
            <div className="cabinet-hero__avatar">{user.full_name.trim().charAt(0).toUpperCase()}</div>
            <div>
              <span className="eyebrow">Особистий кабінет</span>
              <h1>{user.full_name}</h1>
              <div className="cabinet-hero__meta">
                <span>{user.email}</span>
                {user.phone && <span>{user.phone}</span>}
                <span>Гість з {formatDate(user.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="cabinet-hero__stats">
            <div className="cabinet-stat cabinet-stat--gold">
              <span>Бонусний баланс</span>
              <strong>{formatNumber(balance, 2)}</strong>
              <small>1 бонус = 1 ₴</small>
            </div>
            <div className="cabinet-stat">
              <span>Рівень лояльності</span>
              <LoyaltyBadge level={level} />
              <small>
                {bonuses.data ? `Завершених проживань: ${bonuses.data.completed_stays}` : ' '}
              </small>
            </div>
            <div className="cabinet-stat">
              <span>Бронювань</span>
              <strong>{counts.all}</strong>
              <small>активних: {counts.confirmed + counts.checked_in}</small>
            </div>
          </div>
        </section>

        <div className="tabs" role="tablist">
          {(
            [
              ['bookings', 'Мої бронювання'],
              ['bonuses', 'Бонуси'],
              ['profile', 'Профіль'],
            ] as Array<[Tab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`tabs__tab ${tab === key ? 'tabs__tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && (
          <>
            <div className="chip-group cabinet__filters">
              {(['all', 'confirmed', 'checked_in', 'completed', 'cancelled'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  className={`chip ${statusFilter === s ? 'chip--active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'Усі' : BOOKING_STATUS_LABELS[s]} ({counts[s]})
                </button>
              ))}
            </div>
            <AsyncContent
              data={bookings.data}
              loading={bookings.loading}
              error={bookings.error}
              onRetry={bookings.reload}
              isEmpty={(d) => d.length === 0}
              empty={
                <EmptyState
                  icon="🧳"
                  title="У вас ще немає бронювань"
                  text="Оберіть номер у каталозі — це займе кілька хвилин."
                  action={
                    <Link to="/rooms" className="btn btn--primary">
                      До каталогу
                    </Link>
                  }
                />
              }
            >
              {() =>
                filtered.length === 0 ? (
                  <EmptyState icon="🔍" title="Немає бронювань із таким статусом" />
                ) : (
                  <div className="booking-list">
                    {filtered.map((b) => (
                      <BookingCard key={b.id} booking={b} highlighted={b.id === highlightId} onAction={handleAction} />
                    ))}
                  </div>
                )
              }
            </AsyncContent>
          </>
        )}

        {tab === 'bonuses' && (
          <AsyncContent data={bonuses.data} loading={bonuses.loading} error={bonuses.error} onRetry={bonuses.reload}>
            {(data) => (
              <div className="card">
                <h3 className="card__title">Історія бонусних операцій</h3>
                {data.transactions.length === 0 ? (
                  <EmptyState
                    icon="🎁"
                    title="Операцій ще немає"
                    text="Бонуси нараховуються після завершення проживання — відсоток від суми бронювання."
                  />
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Дата</th>
                          <th>Операція</th>
                          <th>Бронювання</th>
                          <th className="num">Сума</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="nowrap">{formatDateTime(tx.created_at)}</td>
                            <td>{tx.reason}</td>
                            <td>{tx.booking_id ? `№${tx.booking_id}` : '—'}</td>
                            <td className={`num ${tx.amount >= 0 ? 'amount-plus' : 'amount-minus'}`}>
                              {tx.amount >= 0 ? '+' : '−'}
                              {formatNumber(Math.abs(tx.amount), 2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </AsyncContent>
        )}

        {tab === 'profile' && (
          <div className="card profile-card">
            <h3 className="card__title">Дані профілю</h3>
            <dl className="profile-list">
              <div>
                <dt>ПІБ</dt>
                <dd>{user.full_name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Телефон</dt>
                <dd>{user.phone || '—'}</dd>
              </div>
              <div>
                <dt>Роль</dt>
                <dd>{ROLE_LABELS[user.role]}</dd>
              </div>
              <div>
                <dt>Рівень лояльності</dt>
                <dd>
                  <LoyaltyBadge level={level} />
                </dd>
              </div>
              <div>
                <dt>Бонусний баланс</dt>
                <dd>{formatMoney(balance)}</dd>
              </div>
              <div>
                <dt>Дата реєстрації</dt>
                <dd>{formatDate(user.created_at)}</dd>
              </div>
            </dl>
            <p className="muted small">
              Рівень лояльності підвищується автоматично після кількох завершених проживань — «Срібний» і «Золотий»
              рівні дають знижку на всі наступні бронювання.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Скасувати бронювання?"
        danger
        pending={cancelAction.pending}
        confirmLabel="Так, скасувати"
        cancelLabel="Ні"
        onClose={() => setToCancel(null)}
        onConfirm={confirmCancel}
        message={
          toCancel && (
            <>
              Бронювання №{toCancel.id} ({toCancel.room.title}, {formatDate(toCancel.check_in)} —{' '}
              {formatDate(toCancel.check_out)}) буде скасовано.
              {toCancel.bonus_used > 0 && <> Списані бонуси ({formatNumber(toCancel.bonus_used, 2)}) повернуться на баланс.</>}
            </>
          )
        }
      />

      <ExtendBookingModal
        booking={toExtend}
        onClose={() => setToExtend(null)}
        onExtended={(updated) => {
          replaceBooking(updated);
          void refreshUser();
        }}
      />
    </div>
  );
}
