import { useId } from 'react';
import type { ISODate } from '../api/types';
import { addDays } from '../utils/dates';

interface DateRangeProps {
  checkIn: ISODate;
  checkOut: ISODate;
  onChange: (range: { checkIn: ISODate; checkOut: ISODate }) => void;
  /** Мінімальна дата заїзду (наприклад, сьогодні). */
  min?: ISODate;
  labels?: [string, string];
  required?: boolean;
  className?: string;
}

/**
 * Пара полів «заїзд / виїзд» на нативних <input type="date">.
 * Дата виїзду завжди щонайменше на день пізніше заїзду.
 */
export function DateRange({
  checkIn,
  checkOut,
  onChange,
  min,
  labels = ['Заїзд', 'Виїзд'],
  required,
  className = '',
}: DateRangeProps) {
  const id = useId();
  const handleCheckIn = (value: ISODate) => {
    let nextOut = checkOut;
    if (value && (!checkOut || checkOut <= value)) nextOut = addDays(value, 1);
    onChange({ checkIn: value, checkOut: nextOut });
  };

  return (
    <div className={`date-range ${className}`}>
      <div className="field">
        <label htmlFor={`${id}-in`}>{labels[0]}</label>
        <input
          id={`${id}-in`}
          type="date"
          className="input"
          value={checkIn}
          min={min}
          required={required}
          onChange={(e) => handleCheckIn(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-out`}>{labels[1]}</label>
        <input
          id={`${id}-out`}
          type="date"
          className="input"
          value={checkOut}
          min={checkIn ? addDays(checkIn, 1) : min}
          required={required}
          onChange={(e) => onChange({ checkIn, checkOut: e.target.value })}
        />
      </div>
    </div>
  );
}
