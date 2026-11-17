import { useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { catalogApi, roomsApi } from '../../api/catalog';
import { AmenityList } from '../../components/AmenityList';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Loader } from '../../components/Loader';
import { BookingPanel } from '../../components/room/BookingPanel';
import { RoomGallery } from '../../components/room/RoomGallery';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { addDays, firstFreeRange, todayISO } from '../../utils/dates';
import { formatDate, formatMoney, guestsLabel } from '../../utils/format';

export function RoomPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();

  const roomState = useAsync(() => roomsApi.get(roomId), [roomId]);
  const busyState = useAsync(() => roomsApi.busyDates(roomId), [roomId]);
  const servicesState = useAsync(() => catalogApi.services(), []);
  const room = roomState.data;
  useDocumentTitle(room ? room.title : 'Номер');

  const today = todayISO();
  // Без дат в URL пропонуємо найближче вільне вікно на 2 ночі (коли відомі зайняті дати).
  const defaults = firstFreeRange(addDays(today, 1), 2, busyState.data ?? []);
  const checkIn = searchParams.get('check_in') ?? defaults.check_in;
  const checkOut = searchParams.get('check_out') ?? addDays(checkIn, 2);
  const guests = Math.max(1, Number(searchParams.get('guests')) || 1);

  const updateParams = useCallback(
    (p: { checkIn: string; checkOut: string; guests: number }) => {
      const next = new URLSearchParams();
      if (p.checkIn) next.set('check_in', p.checkIn);
      if (p.checkOut) next.set('check_out', p.checkOut);
      next.set('guests', String(p.guests));
      setSearchParams(next, { replace: true });
    },
    [setSearchParams],
  );

  if (!Number.isInteger(roomId) || roomId <= 0) {
    return (
      <div className="page container">
        <EmptyState icon="🔎" title="Номер не знайдено" />
      </div>
    );
  }

  if (roomState.error) {
    return (
      <div className="page container">
        <ErrorState message={roomState.error} onRetry={roomState.reload} />
        <p style={{ marginTop: 16 }}>
          <Link to="/rooms">← До каталогу</Link>
        </p>
      </div>
    );
  }

  if (!room) return <Loader page label="Завантаження номера…" />;

  const busy = busyState.data ?? [];

  return (
    <div className="page room-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навігація">
          <Link to="/">Головна</Link>
          <span>/</span>
          <Link to="/rooms">Номери</Link>
          <span>/</span>
          <span>{room.title}</span>
        </nav>

        <div className="room-page__head">
          <div>
            <span className={`room-page__category cat--${room.category.code}`}>{room.category.name}</span>
            <h1>{room.title}</h1>
            <div className="room-page__facts">
              <span>№ {room.number}</span>
              <span>{room.floor} поверх</span>
              <span>до {guestsLabel(room.capacity)}</span>
              <span>
                від <strong>{formatMoney(room.price_per_night)}</strong> / ніч
              </span>
            </div>
          </div>
        </div>

        <div className="room-page__layout">
          <div className="room-page__main">
            <RoomGallery photos={room.photos} title={room.title} />

            <section className="room-section">
              <h2>Про номер</h2>
              <p className="room-page__desc">{room.description}</p>
              {room.category.description && <p className="muted">{room.category.description}</p>}
            </section>

            <section className="room-section">
              <h2>Зручності</h2>
              {room.amenities.length ? (
                <AmenityList amenities={room.amenities} />
              ) : (
                <p className="muted">Перелік зручностей уточнюйте на рецепції.</p>
              )}
            </section>

            <section className="room-section">
              <h2>Зайняті дати</h2>
              {busyState.loading && !busyState.data ? (
                <Loader inline />
              ) : busyState.error ? (
                <div className="alert alert--warning">{busyState.error}</div>
              ) : busy.length === 0 ? (
                <p className="muted">Найближчим часом номер повністю вільний — бронюйте будь-які дати.</p>
              ) : (
                <>
                  <ul className="busy-list">
                    {busy.map((b) => {
                      const conflict = checkIn < b.check_out && b.check_in < checkOut;
                      return (
                        <li key={`${b.check_in}-${b.check_out}`} className={conflict ? 'busy-list__item--conflict' : ''}>
                          {formatDate(b.check_in)} — {formatDate(b.check_out)}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="field__hint">Дата виїзду іншого гостя доступна для вашого заїзду.</p>
                </>
              )}
            </section>
          </div>

          <aside className="room-page__aside">
            {!room.is_active ? (
              <div className="alert alert--warning">Номер тимчасово недоступний для бронювання.</div>
            ) : !busyState.data && !busyState.error ? (
              // Чекаємо зайняті дати, інакше розрахунок піде з конфліктними датами.
              <Loader label="Перевіряємо доступність…" />
            ) : (
              <BookingPanel
                room={room}
                services={servicesState.data ?? []}
                busy={busy}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={Math.min(guests, room.capacity)}
                onParamsChange={updateParams}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
