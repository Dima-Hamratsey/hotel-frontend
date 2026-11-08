import type { BreakdownLine } from '../api/types';
import { formatMoney } from '../utils/format';

interface PriceBreakdownProps {
  lines: BreakdownLine[];
  total: number;
  totalLabel?: string;
}

/** Рядки розрахунку вартості (знижки — від’ємні суми) та підсумок. */
export function PriceBreakdown({ lines, total, totalLabel = 'Разом до сплати' }: PriceBreakdownProps) {
  return (
    <dl className="breakdown">
      {lines.map((line, i) => (
        <div key={`${line.label}-${i}`} className={`breakdown__row ${line.amount < 0 ? 'breakdown__row--minus' : ''}`}>
          <dt>{line.label}</dt>
          <dd>
            {line.amount < 0 ? '−' : ''}
            {formatMoney(Math.abs(line.amount))}
          </dd>
        </div>
      ))}
      <div className="breakdown__row breakdown__row--total">
        <dt>{totalLabel}</dt>
        <dd>{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}
