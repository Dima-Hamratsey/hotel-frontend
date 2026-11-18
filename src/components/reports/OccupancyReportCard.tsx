import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { reportsApi } from '../../api/reports';
import type { OccupancyByDay, OccupancyByRoom } from '../../api/types';
import { useAsync } from '../../hooks/useAsync';
import { AXIS_COLOR, GRID_COLOR, SERIES_PRIMARY } from '../../utils/chartColors';
import { addDays, todayISO } from '../../utils/dates';
import { formatDate, formatPercent } from '../../utils/format';
import { AsyncContent } from '../AsyncContent';
import { DataTable, type Column } from '../admin/DataTable';
import { EmptyState } from '../EmptyState';
import { ChartTooltip, RateBar } from './ChartTooltip';

const shortDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

const ROOM_COLUMNS: Column<OccupancyByRoom>[] = [
  { key: 'number', header: 'Номер', render: (r) => <strong>№ {r.number}</strong> },
  { key: 'category', header: 'Категорія', render: (r) => r.category },
  { key: 'booked', header: 'Зайнято ночей', className: 'num', render: (r) => r.booked_nights },
  { key: 'available', header: 'Доступно ночей', className: 'num', render: (r) => r.available_nights },
  { key: 'rate', header: 'Завантаженість', render: (r) => <RateBar rate={r.rate} /> },
];

export function OccupancyReportCard() {
  const [range, setRange] = useState({ from: addDays(todayISO(), -29), to: todayISO() });
  const valid = range.from <= range.to;
  const report = useAsync(() => reportsApi.occupancy(range.from, range.to), [valid ? range.from : '', valid ? range.to : '']);

  return (
    <section className="chart-card span-2">
      <div className="chart-card__head">
        <div>
          <h3>Завантаженість номерів</h3>
          <p>
            {report.data
              ? `Середня завантаженість: ${formatPercent(report.data.overall_rate)} · номерів у фонді: ${report.data.total_rooms}`
              : 'Частка зайнятих номерів по днях та по кожному номеру'}
          </p>
        </div>
        <div className="inline-controls">
          <input
            type="date"
            className="input"
            aria-label="Початок періоду"
            value={range.from}
            max={range.to}
            onChange={(e) => e.target.value && setRange((r) => ({ ...r, from: e.target.value }))}
          />
          <span className="muted">—</span>
          <input
            type="date"
            className="input"
            aria-label="Кінець періоду"
            value={range.to}
            min={range.from}
            onChange={(e) => e.target.value && setRange((r) => ({ ...r, to: e.target.value }))}
          />
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className="btn btn--ghost btn--sm"
              onClick={() => setRange({ from: addDays(todayISO(), -(d - 1)), to: todayISO() })}
            >
              {d} дн.
            </button>
          ))}
        </div>
      </div>

      <AsyncContent data={report.data} loading={report.loading} error={report.error} onRetry={report.reload}>
        {(data) =>
          data.by_day.length === 0 ? (
            <EmptyState title="Немає даних за період" />
          ) : (
            <>
              <div className="chart-box" role="img" aria-label="Графік завантаженості по днях">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.by_day} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SERIES_PRIMARY} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={SERIES_PRIMARY} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDate}
                      tick={{ fill: AXIS_COLOR, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                      tick={{ fill: AXIS_COLOR, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                    />
                    <Tooltip
                      cursor={{ stroke: AXIS_COLOR, strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        const p = payload?.[0]?.payload as OccupancyByDay | undefined;
                        return (
                          <ChartTooltip
                            active={active && Boolean(p)}
                            title={p && formatDate(p.date)}
                            lines={
                              p
                                ? [
                                    { label: 'Завантаженість', value: formatPercent(p.rate) },
                                    { label: 'Зайнято номерів', value: `${p.occupied} з ${data.total_rooms}` },
                                  ]
                                : []
                            }
                          />
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke={SERIES_PRIMARY}
                      strokeWidth={2}
                      fill="url(#occFill)"
                      activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <h4 style={{ marginTop: 20 }}>По номерах</h4>
              <DataTable
                rows={[...data.by_room].sort((a, b) => b.rate - a.rate)}
                columns={ROOM_COLUMNS}
                rowKey={(r) => r.room_id}
              />
            </>
          )
        }
      </AsyncContent>
    </section>
  );
}
