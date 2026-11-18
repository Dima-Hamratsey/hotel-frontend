import { adminApi } from '../../api/admin';
import type { CategoryIn, CategoryOut } from '../../api/types';
import { CrudManager } from '../../components/admin/CrudManager';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatMoney } from '../../utils/format';

const EMPTY: CategoryIn = { code: '', name: '', description: '', base_price: 0 };

export function CategoriesPage() {
  useDocumentTitle('Категорії');
  return (
    <CrudManager<CategoryOut, CategoryIn>
      resource={adminApi.categories}
      title="Категорії номерів"
      subtitle="Економ, стандарт, люкс та інші класи номерів. Базова ціна — орієнтир «від» на головній сторінці."
      entityAccusative="категорію"
      emptyForm={EMPTY}
      toForm={({ code, name, description, base_price }) => ({ code, name, description, base_price })}
      describe={(c) => c.name}
      validate={(v) => {
        if (!v.code.trim() || !v.name.trim()) return 'Заповніть код та назву';
        if (!/^[a-z0-9_-]+$/.test(v.code)) return 'Код — латиницею, малими літерами (напр. economy)';
        if (v.base_price < 0) return 'Ціна не може бути від’ємною';
        return null;
      }}
      columns={[
        { key: 'code', header: 'Код', render: (c) => <code className="code">{c.code}</code> },
        { key: 'name', header: 'Назва', render: (c) => <strong>{c.name}</strong> },
        { key: 'desc', header: 'Опис', render: (c) => <span className="cell-clamp">{c.description}</span> },
        { key: 'price', header: 'Базова ціна', className: 'num', render: (c) => formatMoney(c.base_price) },
      ]}
      renderForm={({ value, set }) => (
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cat-code">Код</label>
            <input
              id="cat-code"
              className="input"
              required
              placeholder="economy / standard / lux"
              value={value.code}
              onChange={(e) => set('code', e.target.value.trim().toLowerCase())}
            />
          </div>
          <div className="field">
            <label htmlFor="cat-name">Назва</label>
            <input id="cat-name" className="input" required value={value.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field span-2">
            <label htmlFor="cat-desc">Опис</label>
            <textarea
              id="cat-desc"
              className="textarea"
              value={value.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="cat-price">Базова ціна за ніч, ₴</label>
            <input
              id="cat-price"
              className="input"
              type="number"
              min={0}
              step="0.01"
              required
              value={value.base_price}
              onChange={(e) => set('base_price', Number(e.target.value))}
            />
          </div>
        </div>
      )}
    />
  );
}
