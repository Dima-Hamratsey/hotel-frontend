import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi, roomsApi } from '../../api/catalog';
import type { RoomFilters } from '../../api/types';
import { AsyncContent } from '../../components/AsyncContent';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { PageHeader } from '../../components/PageHeader';
import { RoomCard } from '../../components/RoomCard';
import { RoomFiltersPanel } from '../../components/RoomFiltersPanel';
import { useAsync } from '../../hooks/useAsync';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, nightsLabel, plural } from '../../utils/format';
import { nightsBetween } from '../../utils/dates';
import { bookingSearch, filtersFromSearch, filtersToSearch, normalizeFilters } from '../../utils/roomFilters';

export function CatalogPage() {
  useDocumentTitle('Каталог номерів');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Єдине джерело правди для фільтрів — URL (можна поділитися посиланням).
  const filters = useMemo(() => filtersFromSearch(searchParams), [searchParams]);
  const queryKey = useDebounce(filtersToSearch(normalizeFilters(filters)).toString(), 350);

  const lookups = useAsync(() => Promise.all([catalogApi.categories(), catalogApi.amenities()]), []);
  const rooms = useAsync(
    () => roomsApi.list(filtersFromSearch(new URLSearchParams(queryKey))),
    [queryKey],
  );

  const updateFilters = useCallback(
    (patch: Partial<RoomFilters>) => {
      const next = { ...filtersFromSearch(searchParams), ...patch };
      setSearchParams(filtersToSearch(next), { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => setSearchParams(new URLSearchParams(), { replace: true }), [setSearchParams]);

  const nights = nightsBetween(filters.check_in, filters.check_out);
  const [categories, amenities] = lookups.data ?? [[], []];

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Каталог"
          title="Номери та апартаменти"
          subtitle={
            nights > 0
              ? `Вільні номери з ${formatDate(filters.check_in)} по ${formatDate(filters.check_out)} · ${nightsLabel(nights)}`
              : 'Оберіть дати, щоб побачити лише вільні номери, та уточніть пошук фільтрами.'
          }
          actions={
            <button className="btn btn--outline filters-toggle" onClick={() => setShowFilters((v) => !v)}>
              {showFilters ? 'Сховати фільтри' : 'Показати фільтри'}
            </button>
          }
        />

        <div className={`catalog ${showFilters ? 'catalog--filters-open' : ''}`}>
          <RoomFiltersPanel
            value={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            categories={categories}
            amenities={amenities}
          />

          <section className="catalog__results" aria-live="polite">
            {lookups.error && <div className="alert alert--warning">Не вдалося завантажити довідники: {lookups.error}</div>}
            <AsyncContent
              data={rooms.data}
              loading={rooms.loading}
              error={rooms.error}
              onRetry={rooms.reload}
              loadingLabel="Шукаємо номери…"
              isEmpty={(d) => d.length === 0}
              empty={
                <EmptyState
                  title="Номерів не знайдено"
                  text="Спробуйте змінити дати або послабити фільтри."
                  action={
                    <button className="btn btn--dark" onClick={resetFilters}>
                      Скинути фільтри
                    </button>
                  }
                />
              }
            >
              {(list) => (
                <>
                  <div className="catalog__count">
                    Знайдено {list.length} {plural(list.length, ['номер', 'номери', 'номерів'])}
                    {rooms.loading && <Loader inline />}
                  </div>
                  <div className="room-grid">
                    {list.map((room) => (
                      <RoomCard key={room.id} room={room} search={bookingSearch(filters)} />
                    ))}
                  </div>
                </>
              )}
            </AsyncContent>
          </section>
        </div>
      </div>
    </div>
  );
}
