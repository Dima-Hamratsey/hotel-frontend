import { adminApi } from '../../api/admin';
import type { AmenityIn, AmenityOut } from '../../api/types';
import { CrudManager } from '../../components/admin/CrudManager';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { amenityIcon } from '../../utils/amenityIcon';

const EMPTY: AmenityIn = { name: '', icon: '' };
const ICON_SUGGESTIONS = ['📶', '📺', '❄️', '🍾', '🔒', '🌅', '🛁', '☕', '🔥', '🅿️', '💼', '🏔️'];

export function AmenitiesPage() {
  useDocumentTitle('Зручності');
  return (
    <CrudManager<AmenityOut, AmenityIn>
      resource={adminApi.amenities}
      title="Зручності"
      subtitle="Wi-Fi, кондиціонер, міні-бар… Використовуються у фільтрах каталогу та на картках номерів."
      entityAccusative="зручність"
      emptyIcon="📶"
      modalSize="sm"
      emptyForm={EMPTY}
      toForm={({ name, icon }) => ({ name, icon })}
      describe={(a) => a.name}
      validate={(v) => (!v.name.trim() ? 'Вкажіть назву' : null)}
      columns={[
        {
          key: 'icon',
          header: 'Іконка',
          render: (a) => (
            <span className="icon-cell" title={a.icon}>
              {amenityIcon(a.icon)}
            </span>
          ),
        },
        { key: 'name', header: 'Назва', render: (a) => <strong>{a.name}</strong> },
        { key: 'raw', header: 'Значення icon', render: (a) => <code className="code">{a.icon || '—'}</code> },
      ]}
      renderForm={({ value, set }) => (
        <div className="form-stack">
          <div className="field">
            <label htmlFor="am-name">Назва</label>
            <input id="am-name" className="input" required value={value.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="am-icon">Іконка (емодзі або ключове слово)</label>
            <div className="icon-input">
              <span className="icon-cell">{amenityIcon(value.icon)}</span>
              <input
                id="am-icon"
                className="input"
                value={value.icon}
                placeholder="напр. 📶 або wifi"
                onChange={(e) => set('icon', e.target.value)}
              />
            </div>
            <div className="icon-suggestions">
              {ICON_SUGGESTIONS.map((ic) => (
                <button type="button" key={ic} className="icon-suggestion" onClick={() => set('icon', ic)}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
}
