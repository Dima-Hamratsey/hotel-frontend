import type { ServiceOut } from '../../api/types';
import { formatMoney } from '../../utils/format';
import { PRICING_TYPE_LABELS, SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS } from '../../utils/labels';
import { groupServicesByType } from '../../utils/services';

export type ServiceSelection = Record<number, number>; // service_id → quantity

interface ServicePickerProps {
  services: ServiceOut[];
  value: ServiceSelection;
  onChange: (value: ServiceSelection) => void;
}

const MAX_QTY = 10;

/** Вибір додаткових послуг (чекбокс + кількість), згрупованих за типом. */
export function ServicePicker({ services, value, onChange }: ServicePickerProps) {
  const toggle = (id: number) => {
    const next = { ...value };
    if (next[id]) delete next[id];
    else next[id] = 1;
    onChange(next);
  };

  const setQty = (id: number, qty: number) => {
    onChange({ ...value, [id]: Math.max(1, Math.min(MAX_QTY, Math.round(qty) || 1)) });
  };

  return (
    <div className="service-picker">
      {groupServicesByType(services).map(([type, items]) => (
        <fieldset key={type} className="service-picker__group">
          <legend>
            <span aria-hidden>{SERVICE_TYPE_ICONS[type]}</span> {SERVICE_TYPE_LABELS[type]}
          </legend>
          {items.map((s) => {
            const qty = value[s.id];
            return (
              <div key={s.id} className={`service-option ${qty ? 'service-option--on' : ''}`}>
                <label className="checkbox service-option__label">
                  <input type="checkbox" checked={Boolean(qty)} onChange={() => toggle(s.id)} />
                  <span>
                    <span className="service-option__name">{s.name}</span>
                    <span className="service-option__price">
                      {formatMoney(s.price)} {PRICING_TYPE_LABELS[s.pricing_type]}
                    </span>
                  </span>
                </label>
                {qty ? (
                  <div className="qty">
                    <button type="button" onClick={() => setQty(s.id, qty - 1)} disabled={qty <= 1} aria-label="Менше">
                      −
                    </button>
                    <span aria-label="Кількість">×{qty}</span>
                    <button type="button" onClick={() => setQty(s.id, qty + 1)} disabled={qty >= MAX_QTY} aria-label="Більше">
                      +
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
