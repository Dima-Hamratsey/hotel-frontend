import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { catalogApi } from '../../api/catalog';
import { errorMessage } from '../../api/http';
import type { PhotoOut, RoomIn, RoomOut } from '../../api/types';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { PhotoManagerModal } from '../../components/admin/PhotoManagerModal';
import { RoomFormModal } from '../../components/admin/RoomFormModal';
import { AsyncContent } from '../../components/AsyncContent';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { RoomPhoto } from '../../components/RoomPhoto';
import { ActiveBadge } from '../../components/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { formatMoney } from '../../utils/format';

function roomToInput(room: RoomOut, patch: Partial<RoomIn> = {}): RoomIn {
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
    ...patch,
  };
}

export function RoomsAdminPage() {
  useDocumentTitle('Номери');
  const toast = useToast();
  const rooms = useAsync(() => adminApi.rooms.list(), []);
  const lookups = useAsync(() => Promise.all([catalogApi.categories(), catalogApi.amenities()]), []);
  const [categories, amenities] = lookups.data ?? [[], []];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomOut | null>(null);
  const [photosFor, setPhotosFor] = useState<RoomOut | null>(null);
  const [toDelete, setToDelete] = useState<RoomOut | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const replaceRoom = (room: RoomOut) => rooms.setData((list) => (list ?? []).map((r) => (r.id === room.id ? room : r)));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rooms.data ?? [])
      .filter((r) => !categoryFilter || r.category.id === categoryFilter)
      .filter((r) => !q || r.number.toLowerCase().includes(q) || r.title.toLowerCase().includes(q))
      .sort((a, b) => a.number.localeCompare(b.number, 'uk', { numeric: true }));
  }, [rooms.data, search, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (room: RoomOut) => {
    setEditing(room);
    setFormOpen(true);
  };

  const handleSaved = (room: RoomOut, created: boolean) => {
    if (created) rooms.setData((list) => [...(list ?? []), room]);
    else replaceRoom(room);
    toast.success(created ? `Номер № ${room.number} створено` : 'Зміни збережено');
    setFormOpen(false);
  };

  const handlePhotosChange = (roomId: number, photos: PhotoOut[]) =>
    rooms.setData((list) => (list ?? []).map((r) => (r.id === roomId ? { ...r, photos } : r)));

  const askDelete = (room: RoomOut) => {
    setDeleteError(null);
    setToDelete(room);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    setDeleteError(null);
    try {
      await adminApi.rooms.remove(toDelete.id);
      rooms.setData((list) => (list ?? []).filter((r) => r.id !== toDelete.id));
      toast.success(`Номер № ${toDelete.number} видалено`);
      setToDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /** Альтернатива видаленню, якщо в номера є бронювання. */
  const deactivate = async (room: RoomOut) => {
    setBusy(true);
    try {
      const updated = await adminApi.rooms.update(room.id, roomToInput(room, { is_active: false }));
      replaceRoom(updated);
      toast.success(`Номер № ${room.number} деактивовано`);
      setToDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<RoomOut>[] = [
    {
      key: 'room',
      header: 'Номер',
      render: (r) => (
        <div className="cell-room">
          <div className="room-thumb">
            <RoomPhoto url={r.photos[0]?.url} alt={r.title} label="" />
          </div>
          <div>
            <strong>№ {r.number}</strong>
            <span className="cell-sub">{r.title}</span>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Категорія', render: (r) => <span className="tag">{r.category.name}</span> },
    { key: 'floor', header: 'Поверх', className: 'num', render: (r) => r.floor },
    { key: 'capacity', header: 'Місць', className: 'num', render: (r) => r.capacity },
    { key: 'price', header: 'Ціна / ніч', className: 'num', render: (r) => formatMoney(r.price_per_night) },
    { key: 'photos', header: 'Фото', className: 'num', render: (r) => r.photos.length },
    { key: 'active', header: 'Статус', render: (r) => <ActiveBadge active={r.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'actions-col',
      render: (r) => (
        <div className="btn-row table-actions">
          <Link to={`/rooms/${r.id}`} className="btn btn--ghost btn--sm" target="_blank" title="Відкрити на сайті">
            ↗
          </Link>
          <button className="btn btn--outline btn--sm" onClick={() => setPhotosFor(r)}>
            Фото
          </button>
          <button className="btn btn--outline btn--sm" onClick={() => openEdit(r)}>
            Редагувати
          </button>
          <button className="btn btn--danger-outline btn--sm" onClick={() => askDelete(r)}>
            Видалити
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Номерний фонд"
        subtitle="Усі номери, включно з неактивними. Неактивні номери не показуються в каталозі."
        actions={
          <button className="btn btn--primary" onClick={openCreate} disabled={lookups.loading}>
            + Додати номер
          </button>
        }
      />

      <div className="toolbar">
        <div className="field">
          <label htmlFor="rooms-search">Пошук</label>
          <input
            id="rooms-search"
            className="input"
            placeholder="Номер або назва"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="rooms-cat">Категорія</label>
          <select
            id="rooms-cat"
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Усі категорії</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar__spacer" />
        {rooms.data && (
          <span className="muted small">
            Показано {filtered.length} з {rooms.data.length}
          </span>
        )}
      </div>

      <AsyncContent
        data={rooms.data}
        loading={rooms.loading}
        error={rooms.error}
        onRetry={rooms.reload}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            title="Номерів ще немає"
            action={
              <button className="btn btn--dark" onClick={openCreate}>
                Додати номер
              </button>
            }
          />
        }
      >
        {() =>
          filtered.length ? (
            <DataTable rows={filtered} columns={columns} rowKey={(r) => r.id} rowClassName={(r) => (r.is_active ? '' : 'row-muted')} />
          ) : (
            <EmptyState title="Нічого не знайдено" text="Змініть пошуковий запит або категорію." />
          )
        }
      </AsyncContent>

      <RoomFormModal
        open={formOpen}
        room={editing}
        categories={categories}
        amenities={amenities}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <PhotoManagerModal room={photosFor} onClose={() => setPhotosFor(null)} onChange={handlePhotosChange} />

      <Modal
        open={Boolean(toDelete)}
        title="Видалити номер?"
        size="sm"
        onClose={() => !busy && setToDelete(null)}
        footer={
          toDelete && (
            <>
              <button className="btn btn--outline" onClick={() => setToDelete(null)} disabled={busy}>
                Відмінити
              </button>
              {deleteError && toDelete.is_active ? (
                <button className="btn btn--dark" onClick={() => deactivate(toDelete)} disabled={busy}>
                  Деактивувати замість видалення
                </button>
              ) : (
                <button className="btn btn--danger" onClick={confirmDelete} disabled={busy || Boolean(deleteError)}>
                  {busy ? 'Зачекайте…' : 'Видалити'}
                </button>
              )}
            </>
          )
        }
      >
        {toDelete && (
          <>
            <p className="confirm-message">
              Номер № {toDelete.number} «{toDelete.title}» буде видалено разом із фото. Дію неможливо скасувати.
            </p>
            {deleteError && (
              <div className="alert alert--warning">
                <strong>Видалення неможливе.</strong> {deleteError}
                {toDelete.is_active && (
                  <div style={{ marginTop: 6 }}>Ви можете деактивувати номер — він зникне з каталогу, а історія бронювань збережеться.</div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
