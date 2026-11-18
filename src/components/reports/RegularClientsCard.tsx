import { useState } from 'react';
import { reportsApi } from '../../api/reports';
import type { RegularClient } from '../../api/types';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatMoney, formatNumber } from '../../utils/format';
import { AsyncContent } from '../AsyncContent';
import { DataTable, type Column } from '../admin/DataTable';
import { EmptyState } from '../EmptyState';
import { LoyaltyBadge } from '../StatusBadge';

type RankedClient = RegularClient & { rank: number };

const COLUMNS: Column<RankedClient>[] = [
  { key: 'rank', header: '#', className: 'num', render: (c) => c.rank },
  {
    key: 'client',
    header: 'Клієнт',
    render: (c) => (
      <div>
        <strong>{c.full_name}</strong>
        <span className="cell-sub">{c.email}</span>
      </div>
    ),
  },
  { key: 'bookings', header: 'Бронювань', className: 'num', render: (c) => c.bookings },
  { key: 'nights', header: 'Ночей', className: 'num', render: (c) => c.nights },
  { key: 'spent', header: 'Витрачено', className: 'num', render: (c) => <strong>{formatMoney(c.total_spent)}</strong> },
  { key: 'bonus', header: 'Бонуси', className: 'num', render: (c) => formatNumber(c.bonus_points, 2) },
  { key: 'loyalty', header: 'Рівень', render: (c) => <LoyaltyBadge level={c.loyalty_level} /> },
  { key: 'last', header: 'Останнє проживання', render: (c) => formatDate(c.last_stay) },
];

export function RegularClientsCard() {
  const [minBookings, setMinBookings] = useState(2);
  const report = useAsync(() => reportsApi.regularClients(minBookings), [minBookings]);

  return (
    <section className="chart-card span-2">
      <div className="chart-card__head">
        <div>
          <h3>Постійні клієнти</h3>
          <p>Гості з кількома бронюваннями, відсортовані за сумою витрат</p>
        </div>
        <div className="inline-controls">
          <label htmlFor="rc-min" className="muted small">
            Мінімум бронювань
          </label>
          <select id="rc-min" className="select" value={minBookings} onChange={(e) => setMinBookings(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 10].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
      </div>
      <AsyncContent
        data={report.data}
        loading={report.loading}
        error={report.error}
        onRetry={report.reload}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Немає клієнтів за цим критерієм" text="Спробуйте зменшити мінімальну кількість бронювань." />}
      >
        {(rows) => {
          const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));
          return <DataTable pageSize={15} rows={ranked} columns={COLUMNS} rowKey={(r) => r.user_id} />;
        }}
      </AsyncContent>
    </section>
  );
}
