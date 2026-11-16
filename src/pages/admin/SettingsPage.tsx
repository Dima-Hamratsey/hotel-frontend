import { useState, type FormEvent } from 'react';
import { adminApi } from '../../api/admin';
import { errorMessage } from '../../api/http';
import type { SettingsOut } from '../../api/types';
import { AsyncContent } from '../../components/AsyncContent';
import { PageHeader } from '../../components/PageHeader';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';

type NumericKey = Exclude<keyof SettingsOut, 'hotel_name'>;

interface FieldDef {
  key: NumericKey;
  label: string;
  hint: string;
  suffix: string;
  max?: number;
  integer?: boolean;
}

const SECTIONS: Array<{ title: string; text: string; fields: FieldDef[] }> = [
  {
    title: 'Ціноутворення',
    text: 'Правила розрахунку вартості проживання (стратегії та декоратори ціни на бекенді).',
    fields: [
      {
        key: 'weekend_markup_percent',
        label: 'Націнка вихідного дня',
        hint: 'Додається до ціни ночей з п’ятниці на суботу та з суботи на неділю.',
        suffix: '%',
        max: 100,
      },
      {
        key: 'long_stay_nights',
        label: 'Тривале проживання від',
        hint: 'Мінімальна кількість ночей, з якої діє знижка за тривале проживання.',
        suffix: 'ночей',
        integer: true,
      },
      {
        key: 'long_stay_discount_percent',
        label: 'Знижка за тривале проживання',
        hint: 'Відсоток від вартості проживання (без послуг).',
        suffix: '%',
        max: 100,
      },
    ],
  },
  {
    title: 'Бонусна програма',
    text: 'Бонуси нараховуються після завершення проживання; 1 бонус = 1 ₴ при оплаті.',
    fields: [
      {
        key: 'bonus_percent',
        label: 'Нарахування бонусів',
        hint: 'Відсоток від підсумкової суми бронювання, що повертається гостю бонусами.',
        suffix: '%',
        max: 100,
      },
      {
        key: 'bonus_max_share_percent',
        label: 'Максимальна частка оплати бонусами',
        hint: 'Яку частину суми (після знижок) можна оплатити бонусами.',
        suffix: '%',
        max: 100,
      },
    ],
  },
  {
    title: 'Рівні лояльності',
    text: 'Рівень визначається кількістю завершених проживань і дає знижку на проживання та послуги.',
    fields: [
      { key: 'silver_min_stays', label: '«Срібний» рівень від', hint: 'Кількість завершених проживань.', suffix: 'проживань', integer: true },
      { key: 'silver_discount_percent', label: 'Знижка «Срібного» рівня', hint: 'Відсоток знижки.', suffix: '%', max: 100 },
      { key: 'gold_min_stays', label: '«Золотий» рівень від', hint: 'Має бути більше, ніж для «Срібного».', suffix: 'проживань', integer: true },
      { key: 'gold_discount_percent', label: 'Знижка «Золотого» рівня', hint: 'Відсоток знижки.', suffix: '%', max: 100 },
    ],
  },
];

function validate(s: SettingsOut): string | null {
  if (!s.hotel_name.trim()) return 'Вкажіть назву готелю';
  if (s.gold_min_stays <= s.silver_min_stays) return '«Золотий» рівень має вимагати більше проживань, ніж «Срібний»';
  if (s.gold_discount_percent < s.silver_discount_percent) return 'Знижка «Золотого» рівня не може бути меншою за «Срібний»';
  if (s.long_stay_nights < 1) return 'Кількість ночей для тривалого проживання має бути не менше 1';
  return null;
}

export function SettingsPage() {
  useDocumentTitle('Налаштування');
  const settings = useAsync(() => adminApi.settings.get(), []);

  return (
    <>
      <PageHeader title="Налаштування готелю" subtitle="Глобальні параметри ціноутворення та програми лояльності." />
      <AsyncContent data={settings.data} loading={settings.loading} error={settings.error} onRetry={settings.reload}>
        {(data) => <SettingsForm initial={data} onSaved={settings.setData} />}
      </AsyncContent>
    </>
  );
}

function SettingsForm({ initial, onSaved }: { initial: SettingsOut; onSaved: (s: SettingsOut) => void }) {
  const toast = useToast();
  const [form, setForm] = useState<SettingsOut>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const setNum = (key: NumericKey, raw: string) => setForm((f) => ({ ...f, [key]: raw === '' ? 0 : Number(raw) }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await adminApi.settings.update(form);
      onSaved(saved);
      setForm(saved);
      toast.success('Налаштування збережено');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <section className="card settings-section">
        <h3>Загальне</h3>
        <p>Назва використовується в документах та звітах.</p>
        <div className="field" style={{ maxWidth: 480 }}>
          <label htmlFor="set-name">Назва готелю</label>
          <input
            id="set-name"
            className="input"
            required
            value={form.hotel_name}
            onChange={(e) => setForm((f) => ({ ...f, hotel_name: e.target.value }))}
          />
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.title} className="card settings-section">
          <h3>{section.title}</h3>
          <p>{section.text}</p>
          <div className="form-grid">
            {section.fields.map((f) => (
              <div key={f.key} className="field">
                <label htmlFor={`set-${f.key}`}>{f.label}</label>
                <div className="input-suffix">
                  <input
                    id={`set-${f.key}`}
                    className="input"
                    type="number"
                    min={0}
                    max={f.max}
                    step={f.integer ? 1 : 0.1}
                    required
                    value={form[f.key]}
                    onChange={(e) => setNum(f.key, e.target.value)}
                  />
                  <span>{f.suffix}</span>
                </div>
                <span className="field__hint">{f.hint}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {error && <div className="alert alert--error">{error}</div>}

      <div className="sticky-actions">
        <button type="button" className="btn btn--outline" disabled={!dirty || saving} onClick={() => setForm(initial)}>
          Скасувати зміни
        </button>
        <button type="submit" className="btn btn--dark" disabled={!dirty || saving}>
          {saving ? 'Збереження…' : 'Зберегти налаштування'}
        </button>
      </div>
    </form>
  );
}
