import { Link } from 'react-router-dom';
import type { RoomOut } from '../api/types';
import { formatMoney, guestsLabel } from '../utils/format';
import { AmenityList } from './AmenityList';
import { RoomPhoto } from './RoomPhoto';

interface RoomCardProps {
  room: RoomOut;
  /** Query-рядок (дати, гості), який передається на сторінку номера. */
  search?: string;
}

export function RoomCard({ room, search = '' }: RoomCardProps) {
  const to = `/rooms/${room.id}${search}`;
  return (
    <article className="room-card">
      <Link to={to} className="room-card__media" aria-label={room.title}>
        <RoomPhoto url={room.photos[0]?.url} alt={room.title} />
        <span className={`room-card__category cat--${room.category.code}`}>{room.category.name}</span>
      </Link>
      <div className="room-card__body">
        <div className="room-card__meta">
          <span>№ {room.number}</span>
          <span aria-hidden>·</span>
          <span>{room.floor} поверх</span>
          <span aria-hidden>·</span>
          <span>до {guestsLabel(room.capacity)}</span>
        </div>
        <h3 className="room-card__title">
          <Link to={to}>{room.title}</Link>
        </h3>
        <p className="room-card__desc">{room.description}</p>
        <AmenityList amenities={room.amenities} compact max={6} />
        <div className="room-card__footer">
          <div className="room-card__price">
            <strong>{formatMoney(room.price_per_night)}</strong>
            <span> / ніч</span>
          </div>
          <Link to={to} className="btn btn--dark btn--sm">
            Детальніше
          </Link>
        </div>
      </div>
    </article>
  );
}
