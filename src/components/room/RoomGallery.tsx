import { useState } from 'react';
import type { PhotoOut } from '../../api/types';
import { RoomPhoto } from '../RoomPhoto';

interface RoomGalleryProps {
  photos: PhotoOut[];
  title: string;
}

/** Галерея: велике фото та мініатюри для перемикання. */
export function RoomGallery({ photos, title }: RoomGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[Math.min(activeIndex, photos.length - 1)];

  if (photos.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery__main">
          <RoomPhoto url={null} alt={title} label="Фото номера з’явиться незабаром" />
        </div>
      </div>
    );
  }

  const go = (delta: number) => setActiveIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <RoomPhoto url={active.url} alt={title} />
        {photos.length > 1 && (
          <>
            <button className="gallery__nav gallery__nav--prev" onClick={() => go(-1)} aria-label="Попереднє фото">
              ‹
            </button>
            <button className="gallery__nav gallery__nav--next" onClick={() => go(1)} aria-label="Наступне фото">
              ›
            </button>
            <span className="gallery__counter">
              {activeIndex + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="gallery__thumbs">
          {photos.map((p, i) => (
            <button
              key={p.id}
              className={`gallery__thumb ${i === activeIndex ? 'gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Фото ${i + 1}`}
            >
              <RoomPhoto url={p.url} alt={`${title} — фото ${i + 1}`} label="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
