import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { adminApi } from '../../api/admin';
import { errorMessage } from '../../api/http';
import type { PhotoOut, RoomOut } from '../../api/types';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../Modal';
import { RoomPhoto } from '../RoomPhoto';

interface PhotoManagerModalProps {
  room: RoomOut | null;
  onClose: () => void;
  onChange: (roomId: number, photos: PhotoOut[]) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml';
const ALLOWED_EXT = /\.(jpe?g|png|webp|svg)$/i;

/** Керування фото номера: завантаження з попереднім переглядом та видалення. */
export function PhotoManagerModal({ room, onClose, onChange }: PhotoManagerModalProps) {
  return (
    <Modal open={Boolean(room)} title={room ? `Фото: № ${room.number} · ${room.title}` : 'Фото'} onClose={onClose} size="lg">
      {room && <PhotoManager key={room.id} room={room} onChange={onChange} />}
    </Modal>
  );
}

function PhotoManager({ room, onChange }: { room: RoomOut; onChange: PhotoManagerModalProps['onChange'] }) {
  const toast = useToast();
  const [photos, setPhotos] = useState<PhotoOut[]>(room.photos);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Звільняємо object URL попереднього перегляду.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = (next: PhotoOut[]) => {
    setPhotos(next);
    onChange(room.id, next);
  };

  const pick = (f: File | undefined | null) => {
    setError(null);
    if (!f) return;
    if (!ALLOWED_EXT.test(f.name)) {
      setError('Дозволені формати: JPG, PNG, WEBP, SVG');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const photo = await adminApi.rooms.uploadPhoto(room.id, file);
      update([...photos, photo]);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      toast.success('Фото завантажено');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: PhotoOut) => {
    setDeletingId(photo.id);
    try {
      await adminApi.rooms.deletePhoto(photo.id);
      update(photos.filter((p) => p.id !== photo.id));
      toast.success('Фото видалено');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div className="photo-manager__grid">
        {photos.map((p, i) => (
          <div key={p.id} className="photo-tile">
            <RoomPhoto url={p.url} alt={`Фото ${i + 1}`} label="" />
            {i === 0 && <span className="photo-tile__badge">Головне</span>}
            <button
              className="photo-tile__delete"
              onClick={() => handleDelete(p)}
              disabled={deletingId === p.id}
              aria-label="Видалити фото"
              title="Видалити фото"
            >
              {deletingId === p.id ? '…' : '✕'}
            </button>
          </div>
        ))}
        <label
          className={`upload-zone ${drag ? 'upload-zone--drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <strong>+</strong>
          Оберіть або перетягніть файл
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e: ChangeEvent<HTMLInputElement>) => pick(e.target.files?.[0])}
          />
        </label>
      </div>

      {photos.length === 0 && !file && <p className="muted small" style={{ marginTop: 12 }}>У номера ще немає фото — у каталозі показується заглушка.</p>}

      {file && preview && (
        <div className="upload-preview">
          <img src={preview} alt="Попередній перегляд" />
          <div style={{ flex: 1, minWidth: 160 }}>
            <strong>{file.name}</strong>
            <div className="muted small">{(file.size / 1024).toFixed(0)} КБ</div>
          </div>
          <div className="btn-row">
            <button className="btn btn--outline btn--sm" onClick={() => setFile(null)} disabled={uploading}>
              Скасувати
            </button>
            <button className="btn btn--dark btn--sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Завантаження…' : 'Завантажити'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
