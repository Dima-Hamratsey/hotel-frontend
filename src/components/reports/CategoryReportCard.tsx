import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { reportsApi } from '../../api/reports';
import type { CategoryPopularity } from '../../api/types';
import { useAsync } from '../../hooks/useAsync';
import { colorForId } from '../../utils/chartColors';
import { formatMoney, formatPercent } from '../../utils/format';
import { AsyncContent } from '../AsyncContent';
import { EmptyState } from '../EmptyState';
import { ChartTooltip } from './ChartTooltip';

export function CategoryReportCard() {
  const [range, setRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const valid = !range.from || !range.to || range.from <= range.to;
  const report = useAsync(
    () => reportsApi.categories(range.from || undefined, range.to || undefined),
    [valid ? range.from : '', valid ? range.to : ''],
  );

  return (
    <section className="chart-card">
      <div className="chart-card__head">
        <div>
          <h3>Популярність категорій</h3>
          <p>Частка доходу, кількість бронювань і ночей</p>
        </div>
        <div className="inline-controls">
          <input
            type="date"
            className="input"
            aria-label="Початок періоду"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          />
          <span className="muted">—</span>
          <input
            type="date"
            className="input"
            aria-label="Кінець періоду"
            value={range.to}
            min={range.from || undefined}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          />
        </div>
      </div>
      <AsyncContent
        data={report.data}
        loading={report.loading}
        error={report.error}
        onRetry={report.reload}
        isEmpty={(d) => d.length === 0 || d.every((c) => c.bookings === 0)}
        empty={<EmptyState icon="🏷️" title="Бронювань за період немає" />}
      >
        {(data) => {
          const ids = data.map((c) => c.category_id);
          const rows = [...data].sort((a, b) => b.revenue - a.revenue);
          return (
            <>
              <div className="chart-box" style={{ height: 240 }} role="img" aria-label="Кругова діаграма частки доходу за категоріями">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rows}
                      dataKey="revenue"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="88%"
                      paddingAngle={1}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {rows.map((c) => (
                        <Cell key={c.category_id} fill={colorForId(c.category_id, ids)} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        const p = payload?.[0]?.payload as CategoryPopularity | undefined;
                        return (
                          <ChartTooltip
                            active={active && Boolean(p)}
                            title={p?.name}
                            lines={p ? [
                              { label: 'Дохід', value: formatMoney(p.revenue) },
                              { label: 'Частка', value: formatPercent(p.share) },
                              { label: 'Бронювань', value: p.bookings },
                            ] : []}
                          />
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Категорія</th>
                      <th className="num">Бронювань</th>
                      <th className="num">Ночей</th>
                      <th className="num">Дохід</th>
                      <th className="num">Частка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.category_id}>
                        <td>
                          <span className="legend-dot" style={{ background: colorForId(c.category_id, ids) }} />
                          {c.name}
                        </td>
                        <td className="num">{c.bookings}</td>
                        <td className="num">{c.nights}</td>
                        <td className="num">{formatMoney(c.revenue)}</td>
                        <td className="num">{formatPercent(c.share)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        }}
      </AsyncContent>
    </section>
  );
}
