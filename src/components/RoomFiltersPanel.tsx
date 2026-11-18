import type { AmenityOut, CategoryOut, RoomFilters, RoomSort } from '../api/types';
import { todayISO } from '../utils/dates';
import { SORT_LABELS } from '../utils/labels';
import { DateRange } from './DateRange';

interface RoomFiltersPanelProps {
  value: RoomFilters;
  onChange: (patch: Partial<RoomFilters>) => void;
  onReset: () => void;
  categories: CategoryOut[];
  amenities: AmenityOut[];
}

function toNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Панель фільтрів каталогу. Повністю керована (стан живе в URL сторінки). */
export function RoomFiltersPanel({ value, onChange, onReset, categories, amenities }: RoomFiltersPanelProps) {
  const selectedAmenities = value.amenities ?? [];

  const toggleAmenity = (id: number) => {
    const next = selectedAmenities.includes(id)
      ? selectedAmenities.filter((a) => a !== id)
      : [...selectedAmenities, id];
    onChange({ amenities: next.length ? next : undefined });
  };

  return (
    <aside className="filters" aria-label="Фільтри">
      <div className="filters__head">
        <h3>Фільтри</h3>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
          Скинути
        </button>
      </div>

      <section className="filters__section">
        <h4 className="filters__label">Дати проживання</h4>
        <DateRange
          checkIn={value.check_in ?? ''}
          checkOut={value.check_out ?? ''}
          min={todayISO()}
          onChange={({ checkIn, checkOut }) =>
            onChange({ check_in: checkIn || undefined, check_out: checkOut || undefined })
          }
        />
        <p className="field__hint">Якщо вказати обидві дати, показуються лише вільні номери.</p>
      </section>

      <section className="filters__section">
        <h4 className="filters__label">Категорія</h4>
        <div className="chip-group">
          <button
            type="button"
            className={`chip ${value.category_id === undefined ? 'chip--active' : ''}`}
            onClick={() => onChange({ category_id: undefined })}
          >
            Усі
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`chip ${value.category_id === c.id ? 'chip--active' : ''}`}
              onClick={() => onChange({ category_id: c.id })}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="filters__section">
        <h4 className="filters__label">Ціна за ніч, ₴</h4>
        <div className="filters__row">
          <input
            className="input"
            type="number"
            min={0}
            step={100}
            placeholder="від"
            aria-label="Мінімальна ціна"
            value={value.min_price ?? ''}
            onChange={(e) => onChange({ min_price: toNumber(e.target.value) })}
          />
          <span className="filters__dash">—</span>
          <input
            className="input"
            type="number"
            min={0}
            step={100}
            placeholder="до"
            aria-label="Максимальна ціна"
            value={value.max_price ?? ''}
            onChange={(e) => onChange({ max_price: toNumber(e.target.value) })}
          />
        </div>
      </section>

      <section className="filters__section">
        <h4 className="filters__label">Кількість гостей</h4>
        <div className="stepper">
          <button
            type="button"
            className="stepper__btn"
            onClick={() => onChange({ guests: value.guests && value.guests > 1 ?value.guests - 1 : undefined })}
            disabled={!value.guests}
            aria-label="Менше гостей"
          >
            −
          </button>
          <span className="stepper__value">{value.guests ?? 'Будь-яка'}</span>
          <button
            type="button"
            className="stepper__btn"
            onClick={() => onChange({ guests: Math.min((value.guests ?? 0) + 1, 10) })}
            aria-label="Більше гостей"
          >
            +
          </button>
        </div>
      </section>

      {amenities.length > 0 && (
        <section className="filters__section">
          <h4 className="filters__label">Зручності</h4>
          <div className="filters__checks">
            {amenities.map((a) => (
              <label key={a.id} className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(a.id)}
                  onChange={() => toggleAmenity(a.id)}
                />
                {a.name}
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="filters__section">
        <label className="filters__label" htmlFor="filters-sort">
          Сортування
        </label>
        <select
          id="filters-sort"
          className="select"
          value={value.sort ?? ''}
          onChange={(e) => onChange({ sort: (e.target.value || undefined) as RoomSort | undefined })}
        >
          <option value="">За замовчуванням</option>
          {(Object.keys(SORT_LABELS) as RoomSort[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}
