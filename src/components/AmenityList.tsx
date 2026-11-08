import type { AmenityOut } from '../api/types';
import { amenityIcon } from '../utils/amenityIcon';

interface AmenityListProps {
  amenities: AmenityOut[];
  /** Компактний режим: лише іконки з підказками. */
  compact?: boolean;
  max?: number;
}

export function AmenityList({ amenities, compact, max }: AmenityListProps) {
  const shown = max ? amenities.slice(0, max) : amenities;
  const rest = amenities.length - shown.length;

  if (compact) {
    return (
      <ul className="amenity-icons" aria-label="Зручності">
        {shown.map((a) => (
          <li key={a.id} title={a.name}>
            <span aria-hidden>{amenityIcon(a.icon)}</span>
            <span className="sr-only">{a.name}</span>
          </li>
        ))}
        {rest > 0 && <li className="amenity-icons__more">+{rest}</li>}
      </ul>
    );
  }

  return (
    <ul className="amenity-list">
      {shown.map((a) => (
        <li key={a.id}>
          <span className="amenity-list__icon" aria-hidden>
            {amenityIcon(a.icon)}
          </span>
          {a.name}
        </li>
      ))}
    </ul>
  );
}
