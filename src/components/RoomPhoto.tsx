import { useState } from 'react';
import { mediaUrl } from '../api/config';

interface RoomPhotoProps {
  url: string | null | undefined;
  alt: string;
  className?: string;
  label?: string;
}

/** Фото номера з елегантною заглушкою, якщо фото відсутнє або не завантажилось. */
export function RoomPhoto({ url, alt, className = '', label }: RoomPhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = mediaUrl(url);

  if (!src || failedSrc === src) {
    return (
      <div className={`photo-placeholder ${className}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 64 40" aria-hidden>
          <path d="M4 36 L22 14 L32 26 L40 18 L60 36 Z" />
          <circle cx="48" cy="9" r="4" />
        </svg>
        <span>{label ?? 'Фото незабаром'}</span>
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />;
}
