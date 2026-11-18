import { useMemo, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminBookingAction, AdminBookingFilters, BookingOut, BookingStatus } from '../../api/types';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { AsyncContent } from '../../components/AsyncContent';
import { BookingDetails } from '../../components/booking/BookingDetails';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, formatDateTime, formatMoney, guestsLabel, nightsLabel } from '../../utils/format';
import { BOOKING_ACTION_LABELS, BOOKING_STATUS_LABELS } from '../../utils/labels';

const ADMIN_ACTIONS: AdminBookingAction[] = ['check_in', 'complete', 'cancel'];
const ACTION_STYLE: Record<AdminBookingAction, string> = {
  check_in: 'btn--dark',
  complete: 'btn--success',
  cancel: 'btn--danger-outline',
};
const SUCCESS_MESSAGES: Record<AdminBookingAction, string> = {
  check_in: 'Гостя заселено',
  complete: 'Проживання завершено, бонуси нараховано',
  cancel: 'Бронювання скасовано',
};

export function BookingsAdminPage() {
  useDocumentTitle('Бронювання');
  const [filters, setFilters] = useState<AdminBookingFilters>({});
  const [search, setSearch] = useState('');
  const [details, setDetails] = useState<BookingOut | null>(null);
  const [toCancel, setToCancel] = useState<BookingOut | null>(null);
  const action = useAsyncAction();
  const [actingId, setActingId] = useState<number | null>(null);

  const validRange = !filters.date_from || !filters.date_to || filters.date_from <= filters.date_to;
  const bookings = useAsync(
    () => adminApi.bookings.list(validRange ? filters : { status: filters.status }),
    [filters.status, filters.date_from, filters.date_to, validRange],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings.data ?? [];
    return (bookings.data ?? []).filter(
      (b) =>
        String(b.id) === q.replace('№', '') ||
        b.user.full_name.toLowerCase().includes(q) ||
        b.user.email.toLowerCase().includes(q) ||
        b.room.number.toLowerCase().includes(q),
    );
  }, [bookings.data, search]);

  const runAction = async (booking: BookingOut, act: AdminBookingAction) => {
    setActingId(booking.id);
    const updated = await action.run(() => adminApi.bookings.action(booking.id, act), `№${booking.id}: ${SUCCESS_MESSAGES[act]}`);
    setActingId(null);
    if (updated) {
      bookings.setData((list) => (list ?? []).map((b) => (b.id === updated.id ? updated : b)));
      if (details?.id === updated.id) setDetails(updated);
    }
    return updated;
  };

  const handleAction = (booking: BookingOut, act: AdminBookingAction) => {
    if (act === 'cancel') setToCancel(booking);
    else void runAction(booking, act);
  };

  /** Кнопки дій формуються з allowed_actions, які повертає бекенд. */
  const actionButtons = (b: BookingOut) =>
    ADMIN_ACTIONS.filter((a) => b.allowed_actions.includes(a)).map((a) => (
      <button
        key={a}
        className={`btn btn--sm ${ACTION_STYLE[a]}`}
        disabled={action.pending && actingId === b.id}
        onClick={() => handleAction(b, a)}
      >
        {BOOKING_ACTION_LABELS[a]}
      </button>
    ));

  const renderActions = (b: BookingOut) => (
    <div className="btn-row table-actions">
      <button className="btn btn--ghost btn--sm" onClick={() => setDetails(b)}>
        Деталі
      </button>
      {actionButtons(b)}
    </div>
  );

  const columns: Column<BookingOut>[] = [
    { key: 'id', header: '№', render: (b) => <strong>{b.id}</strong> },
    {
      key: 'guest',
      header: 'Гість',
      render: (b) => (
        <div>
          <strong>{b.user.full_name}</strong>
          <span className="cell-sub">{b.user.email}</span>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Номер',
      render: (b) => (
        <div>
          № {b.room.number}
          <span className="cell-sub">{b.room.category_name}</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Проживання',
      render: (b) => (
        <div className="nowrap">
          {formatDate(b.check_in)} — {formatDate(b.check_out)}
          <span className="cell-sub">
            {nightsLabel(b.nights)}, {guestsLabel(b.guests)}
          </span>
        </div>
      ),
    },
    { key: 'total', header: 'Сума', className: 'num', render: (b) => formatMoney(b.total_price) },
    { key: 'status', header: 'Статус', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'actions', header: '', className: 'actions-col', render: renderActions },
  ];

  return (
    <>
      <PageHeader
        title="Бронювання"
        subtitle="Керування життєвим циклом: Підтверджено → Заселено → Завершено, або Скасовано."
        actions={
          <button className="btn btn--outline" onClick={bookings.reload} disabled={bookings.loading}>
            Оновити
          </button>
        }
      />

      <div className="toolbar">
        <div className="field">
          <label htmlFor="bk-status">Статус</label>
          <select
            id="bk-status"
            className="select"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as BookingStatus | undefined }))}
          >
            <option value="">Усі статуси</option>
            {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="bk-from">Період з</label>
          <input
            id="bk-from"
            type="date"
            className="input"
            value={filters.date_from ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value || undefined }))}
          />
        </div>
        <div className="field">
          <label htmlFor="bk-to">по</label>
          <input
            id="bk-to"
            type="date"
            className={`input ${validRange ? '' : 'input--invalid'}`}
            value={filters.date_to ?? ''}
            min={filters.date_from}
            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value || undefined }))}
          />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="bk-search">Пошук</label>
          <input
            id="bk-search"
            className="input"
            placeholder="№ бронювання, гість, email, номер кімнати"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {(filters.status || filters.date_from || filters.date_to || search) && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setFilters({});
              setSearch('');
            }}
          >
            Скинути
          </button>
        )}
      </div>
      {!validRange && <div className="alert alert--warning" style={{ marginBottom: 16 }}>Дата «по» має бути не раніше дати «з».</div>}

      <AsyncContent
        data={bookings.data}
        loading={bookings.loading}
        error={bookings.error}
        onRetry={bookings.reload}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon="🗓️" title="Бронювань не знайдено" text="Змініть фільтри або період." />}
      >
        {() =>
          rows.length ? (
            <DataTable pageSize={25} rows={rows} columns={columns} rowKey={(b) => b.id} rowClassName={(b) => (b.status === 'cancelled' ? 'row-muted' : '')} />
          ) : (
            <EmptyState icon="🔍" title="Нічого не знайдено за запитом" />
          )
        }
      </AsyncContent>

      <Modal
        open={Boolean(details)}
        title={details ? `Бронювання №${details.id}` : ''}
        onClose={() => setDetails(null)}
        size="lg"
        footer={details && details.allowed_actions.length > 0 && <div className="btn-row">{actionButtons(details)}</div>}
      >
        {details && (
          <div className="booking-modal">
            <div className="booking-modal__grid">
              <div>
                <span className="field__label">Гість</span>
                <div>
                  <strong>{details.user.full_name}</strong>
                  <span className="cell-sub">{details.user.email}</span>
                </div>
              </div>
              <div>
                <span className="field__label">Номер</span>
                <div>
                  № {details.room.number} · {details.room.title}
                  <span className="cell-sub">{details.room.category_name}</span>
                </div>
              </div>
              <div>
                <span className="field__label">Проживання</span>
                <div>
                  {formatDate(details.check_in)} — {formatDate(details.check_out)}
                  <span className="cell-sub">
                    {nightsLabel(details.nights)}, {guestsLabel(details.guests)}
                  </span>
                </div>
              </div>
              <div>
                <span className="field__label">Статус</span>
                <div>
                  <StatusBadge status={details.status} />
                  <span className="cell-sub">Створено {formatDateTime(details.created_at)}</span>
                </div>
              </div>
            </div>
            <BookingDetails booking={details} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Скасувати бронювання?"
        danger
        pending={action.pending}
        confirmLabel="Скасувати бронювання"
        cancelLabel="Ні"
        onClose={() => setToCancel(null)}
        onConfirm={async () => {
          if (toCancel) await runAction(toCancel, 'cancel');
          setToCancel(null);
        }}
        message={
          toCancel && (
            <>
              Бронювання №{toCancel.id} гостя {toCancel.user.full_name} (№ {toCancel.room.number},{' '}
              {formatDate(toCancel.check_in)} — {formatDate(toCancel.check_out)}) буде скасовано. Списані бонуси
              повернуться гостю.
            </>
          )
        }
      />
    </>
  );
}
