import { useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { errorMessage } from '../../api/http';
import type { AmenityOut, CategoryOut, RoomIn, RoomOut } from '../../api/types';
import { amenityIcon } from '../../utils/amenityIcon';
import { Modal } from '../Modal';

interface RoomFormModalProps {
  open: boolean;
  room: RoomOut | null;
  categories: CategoryOut[];
  amenities: AmenityOut[];
  onClose: () => void;
  onSaved: (room: RoomOut, created: boolean) => void;
}

function toForm(room: RoomOut | null, categories: CategoryOut[]): RoomIn {
  if (!room) {
    return {
      number: '',
      title: '',
      description: '',
      floor: 1,
      capacity: 2,
      price_per_night: categories[0]?.base_price ?? 0,
      category_id: categories[0]?.id ?? 0,
      amenity_ids: [],
      is_active: true,
    };
  }
  return {
    number: room.number,
    title: room.title,
    description: room.description,
    floor: room.floor,
    capacity: room.capacity,
    price_per_night: room.price_per_night,
    category_id: room.category.id,
    amenity_ids: room.amenities.map((a) => a.id),
    is_active: room.is_active,
  };
}

export function RoomFormModal(props: RoomFormModalProps) {
  return (
    <Modal open={props.open} title={props.room ? `Редагувати номер № ${props.room.number}` : 'Новий номер'} onClose={props.onClose} size="lg">
      {props.open && <RoomForm key={props.room?.id ?? 'new'} {...props} />}
    </Modal>
  );
}

function RoomForm({ room, categories, amenities, onClose, onSaved }: RoomFormModalProps) {
  const [form, setForm] = useState<RoomIn>(() => toForm(room, categories));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof RoomIn>(key: K, value: RoomIn[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (id: number) =>
    set('amenity_ids', form.amenity_ids.includes(id) ? form.amenity_ids.filter((a) => a !== id) : [...form.amenity_ids, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.category_id) {
      setError('Оберіть категорію (спершу створіть її в розділі «Категорії»)');
      return;
    }
    if (form.capacity < 1) {
      setError('Місткість має бути не менше 1');
      return;
    }
    if (form.price_per_night <= 0) {
      setError('Вкажіть ціну за ніч');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: RoomIn = { ...form, number: form.number.trim(), title: form.title.trim() };
      const saved = room ? await adminApi.rooms.update(room.id, payload) : await adminApi.rooms.create(payload);
      onSaved(saved, !room);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="room-number">Номер кімнати</label>
          <input id="room-number" className="input" required value={form.number} onChange={(e) => set('number', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="room-category">Категорія</label>
          <select
            id="room-category"
            className="select"
            required
            value={form.category_id || ''}
            onChange={(e) => set('category_id', Number(e.target.value))}
          >
            <option value="" disabled>
              Оберіть категорію
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field span-2">
          <label htmlFor="room-title">Назва</label>
          <input
            id="room-title"
            className="input"
            required
            placeholder="напр. Стандарт з видом на гори"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label htmlFor="room-desc">Опис</label>
          <textarea
            id="room-desc"
            className="textarea"
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="room-floor">Поверх</label>
          <input
            id="room-floor"
            className="input"
            type="number"
            required
            value={form.floor}
            onChange={(e) => set('floor', Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="room-capacity">Місткість (гостей)</label>
          <input
            id="room-capacity"
            className="input"
            type="number"
            min={1}
            max={20}
            required
            value={form.capacity}
            onChange={(e) => set('capacity', Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="room-price">Ціна за ніч, ₴</label>
          <input
            id="room-price"
            className="input"
            type="number"
            min={0}
            step="0.01"
            required
            value={form.price_per_night}
            onChange={(e) => set('price_per_night', Number(e.target.value))}
          />
          <span className="field__hint">Для п’ятниці та суботи автоматично діє націнка вихідного дня.</span>
        </div>
        <div className="field" style={{ justifyContent: 'center' }}>
          <label className="checkbox">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
            Номер активний (видно в каталозі)
          </label>
        </div>
        <div className="field span-2">
          <span className="field__label">Зручності</span>
          {amenities.length === 0 ? (
            <span className="field__hint">Зручностей ще немає — додайте їх у розділі «Зручності».</span>
          ) : (
            <div className="amenity-checks">
              {amenities.map((a) => (
                <label key={a.id} className="checkbox">
                  <input type="checkbox" checked={form.amenity_ids.includes(a.id)} onChange={() => toggleAmenity(a.id)} />
                  <span aria-hidden>{amenityIcon(a.icon)}</span>
                  {a.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn--outline" onClick={onClose} disabled={saving}>
          Скасувати
        </button>
        <button type="submit" className="btn btn--dark" disabled={saving}>
          {saving ? 'Збереження…' : room ? 'Зберегти зміни' : 'Створити номер'}
        </button>
      </div>
    </form>
  );
}
