import type { ReactNode } from 'react';

interface ChartTooltipProps {
  active?: boolean;
  title?: ReactNode;
  lines: Array<{ label: string; value: ReactNode; color?: string }>;
}

/** Уніфікований вміст підказки для графіків recharts. */
export function ChartTooltip({ active, title, lines }: ChartTooltipProps) {
  if (!active) return null;
  return (
    <div className="chart-tooltip">
      {title && <strong>{title}</strong>}
      {lines.map((l) => (
        <div key={l.label}>
          {l.color && <span className="legend-dot" style={{ background: l.color }} />}
          {l.label}: {l.value}
        </div>
      ))}
    </div>
  );
}

export function RateBar({ rate }: { rate: number }) {
  const pct = Math.max(0, Math.min(1, rate)) * 100;
  return (
    <div className="progress">
      <div className="progress__bar">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__value">{pct.toFixed(1).replace('.', ',')} %</span>
    </div>
  );
}
