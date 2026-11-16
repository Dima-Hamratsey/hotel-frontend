import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { reportsApi } from '../../api/reports';
import type { RevenueMonth } from '../../api/types';
import { useAsync } from '../../hooks/useAsync';
import { AXIS_COLOR, GRID_COLOR, SERIES_PRIMARY } from '../../utils/chartColors';
import { formatMoney, formatNumber } from '../../utils/format';
import { MONTH_FULL_LABELS, MONTH_LABELS } from '../../utils/labels';
import { AsyncContent } from '../AsyncContent';
import { ChartTooltip } from './ChartTooltip';

const compactMoney = (v: number) =>
  v >= 1000 ? `${formatNumber(v / 1000, 1)}k` : formatNumber(v);

export function RevenueReportCard() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const report = useAsync(() => reportsApi.revenue(year), [year]);
  const years = Array.from({ length: 5 }, (_, i) => currentYear + 1 - i);

  return (
    <section className="chart-card">
      <div className="chart-card__head">
        <div>
          <h3>Дохід по місяцях</h3>
          <p>{report.data ? `Усього за ${report.data.year} рік: ${formatMoney(report.data.total)}` : 'Неcкасовані бронювання за місяцем заїзду'}</p>
        </div>
        <div className="inline-controls">
          <select className="select" aria-label="Рік" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AsyncContent data={report.data} loading={report.loading} error={report.error} onRetry={report.reload}>
        {(data) => {
          // Гарантуємо всі 12 місяців навіть якщо бекенд повернув лише ненульові.
          const months: RevenueMonth[] = Array.from({ length: 12 }, (_, i) => {
            const m = data.months.find((x) => x.month === i + 1);
            return m ?? { month: i + 1, revenue: 0, bookings: 0 };
          });
          const best = months.reduce((a, b) => (b.revenue > a.revenue ? b : a), months[0]);
          return (
            <>
              <div className="chart-box" role="img" aria-label="Стовпчикова діаграма доходу по місяцях">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
                    <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(m: number) => MONTH_LABELS[m - 1]}
                      tick={{ fill: AXIS_COLOR, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tickFormatter={compactMoney} tick={{ fill: AXIS_COLOR, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip
                      cursor={{ fill: 'rgba(201,162,75,0.12)' }}
                      content={({ active, payload }) => {
                        const p = payload?.[0]?.payload as RevenueMonth | undefined;
                        return (
                          <ChartTooltip
                            active={active && Boolean(p)}
                            title={p && `${MONTH_FULL_LABELS[p.month - 1]} ${data.year}`}
                            lines={p ? [
                              { label: 'Дохід', value: formatMoney(p.revenue) },
                              { label: 'Бронювань', value: p.bookings },
                            ] : []}
                          />
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill={SERIES_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {best.revenue > 0 && (
                <p className="muted small" style={{ marginTop: 10 }}>
                  Найприбутковіший місяць: <strong>{MONTH_FULL_LABELS[best.month - 1]}</strong> — {formatMoney(best.revenue)} (
                  {best.bookings} бронювань)
                </p>
              )}
            </>
          );
        }}
      </AsyncContent>
    </section>
  );
}
