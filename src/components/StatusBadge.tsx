import type { BookingStatus, LoyaltyLevel } from '../api/types';
import { BOOKING_STATUS_LABELS, LOYALTY_LABELS } from '../utils/labels';

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`badge badge--${status}`}>{BOOKING_STATUS_LABELS[status] ?? status}</span>;
}

const LOYALTY_ICONS: Record<LoyaltyLevel, string> = { none: '◇', silver: '◆', gold: '★' };

export function LoyaltyBadge({ level }: { level: LoyaltyLevel }) {
  return (
    <span className={`loyalty loyalty--${level}`}>
      <span aria-hidden>{LOYALTY_ICONS[level] ?? '◇'}</span>
      {LOYALTY_LABELS[level] ?? level}
    </span>
  );
}

export function ActiveBadge({ active, labels }: { active: boolean; labels?: [string, string] }) {
  const [on, off] = labels ?? ['Активний', 'Неактивний'];
  return <span className={`badge ${active ? 'badge--active' : 'badge--inactive'}`}>{active ? on : off}</span>;
}
