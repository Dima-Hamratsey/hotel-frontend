import { adminApi } from '../../api/admin';
import type { PricingType, ServiceIn, ServiceOut, ServiceType } from '../../api/types';
import { CrudManager } from '../../components/admin/CrudManager';
import { ActiveBadge } from '../../components/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatMoney } from '../../utils/format';
import { PRICING_TYPE_LABELS, SERVICE_TYPE_LABELS } from '../../utils/labels';

const EMPTY: ServiceIn = {
  code: '',
  name: '',
  description: '',
  type: 'meal',
  price: 0,
  pricing_type: 'per_stay',
  is_active: true,
};

const PRICING_HINTS: Record<PricingType, string> = {
  per_stay: 'ціна × кількість (одноразово за все перебування)',
  per_night: 'ціна × кількість ночей × кількість',
  per_person_per_night: 'ціна × гості × ночі × кількість',
};

export function ServicesAdminPage() {
  useDocumentTitle('Послуги');
  return (
    <CrudManager<ServiceOut, ServiceIn>
      resource={adminApi.services}
      title="Додаткові послуги"
      subtitle="Харчування, трансфер, SPA. Неактивні послуги не показуються клієнтам при бронюванні."
      entityAccusative="послугу"
      emptyForm={EMPTY}
      toForm={({ code, name, description, type, price, pricing_type, is_active }) => ({
        code,
        name,
        description,
        type,
        price,
        pricing_type,
        is_active,
      })}
      describe={(s) => s.name}
      validate={(v) => {
        if (!v.code.trim() || !v.name.trim()) return 'Заповніть код та назву';
        if (v.price < 0) return 'Ціна не може бути від’ємною';
        return null;
      }}
      columns={[
        {
          key: 'name',
          header: 'Послуга',
          render: (s) => (
            <div>
              <strong>{s.name}</strong>
              <div className="muted small">
                <code className="code">{s.code}</code>
              </div>
            </div>
          ),
        },
        {
          key: 'type',
          header: 'Тип',
          render: (s) => (
            <span className="tag">
              {SERVICE_TYPE_LABELS[s.type]}
            </span>
          ),
        },
        { key: 'pricing', header: 'Тарифікація', render: (s) => PRICING_TYPE_LABELS[s.pricing_type] },
        { key: 'price', header: 'Ціна', className: 'num', render: (s) => formatMoney(s.price) },
        { key: 'active', header: 'Статус', render: (s) => <ActiveBadge active={s.is_active} labels={['Активна', 'Неактивна']} /> },
      ]}
      renderForm={({ value, set }) => (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="svc-code">Код</label>
            <input
              id="svc-code"
              className="input"
              required
              placeholder="breakfast"
              value={value.code}
              onChange={(e) => set('code', e.target.value.trim())}
            />
          </div>
          <div className="field">
            <label htmlFor="svc-name">Назва</label>
            <input id="svc-name" className="input" required value={value.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field span-2">
            <label htmlFor="svc-desc">Опис</label>
            <textarea
              id="svc-desc"
              className="textarea"
              value={value.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="svc-type">Тип</label>
            <select
              id="svc-type"
              className="select"
              value={value.type}
              onChange={(e) => set('type', e.target.value as ServiceType)}
            >
              {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((t) => (
                <option key={t} value={t}>
                  {SERVICE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="svc-price">Ціна, ₴</label>
            <input
              id="svc-price"
              className="input"
              type="number"
              min={0}
              step="0.01"
              required
              value={value.price}
              onChange={(e) => set('price', Number(e.target.value))}
            />
          </div>
          <div className="field span-2">
            <label htmlFor="svc-pricing">Спосіб тарифікації</label>
            <select
              id="svc-pricing"
              className="select"
              value={value.pricing_type}
              onChange={(e) => set('pricing_type', e.target.value as PricingType)}
            >
              {(Object.keys(PRICING_TYPE_LABELS) as PricingType[]).map((p) => (
                <option key={p} value={p}>
                  {PRICING_TYPE_LABELS[p]}
                </option>
              ))}
            </select>
            <span className="field__hint">Формула: {PRICING_HINTS[value.pricing_type]}</span>
          </div>
          <label className="checkbox span-2">
            <input type="checkbox" checked={value.is_active} onChange={(e) => set('is_active', e.target.checked)} />
            Послуга активна (доступна для бронювання)
          </label>
        </div>
      )}
    />
  );
}
