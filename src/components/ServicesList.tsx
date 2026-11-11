import { catalogApi } from '../api/catalog';
import { useAsync } from '../hooks/useAsync';
import { formatMoney } from '../utils/format';
import { groupServicesByType } from '../utils/services';
import { PRICING_TYPE_LABELS, SERVICE_TYPE_ICONS, SERVICE_TYPE_LABELS } from '../utils/labels';
import { AsyncContent } from './AsyncContent';
import { EmptyState } from './EmptyState';

/** Публічний перелік активних послуг, згрупований за типом. */
export function ServicesList() {
  const { data, loading, error, reload } = useAsync(() => catalogApi.services(), []);

  return (
    <AsyncContent
      data={data}
      loading={loading}
      error={error}
      onRetry={reload}
      isEmpty={(d) => d.length === 0}
      empty={<EmptyState icon="✨" title="Послуги ще не додано" />}
    >
      {(services) => (
        <div className="service-groups">
          {groupServicesByType(services).map(([type, items]) => (
            <div key={type} className="service-group">
              <h3 className="service-group__title">
                <span aria-hidden>{SERVICE_TYPE_ICONS[type]}</span> {SERVICE_TYPE_LABELS[type]}
              </h3>
              <ul className="service-group__list">
                {items.map((s) => (
                  <li key={s.id} className="service-item">
                    <div>
                      <strong>{s.name}</strong>
                      {s.description && <p>{s.description}</p>}
                    </div>
                    <span className="service-item__price">
                      {formatMoney(s.price)}
                      <small>{PRICING_TYPE_LABELS[s.pricing_type]}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </AsyncContent>
  );
}
