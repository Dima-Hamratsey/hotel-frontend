import { Link } from 'react-router-dom';
import { reportsApi } from '../../api/reports';
import { AsyncContent } from '../../components/AsyncContent';
import { PageHeader } from '../../components/PageHeader';
import { StatTile } from '../../components/admin/StatTile';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatLongDate, formatMoney, formatNumber, formatPercent } from '../../utils/format';
import { todayISO } from '../../utils/dates';

const QUICK_LINKS = [
  { to: '/admin/bookings', icon: '🗓️', title: 'Бронювання', text: 'Заселення, виїзд, скасування' },
  { to: '/admin/reports', icon: '📈', title: 'Звіти', text: 'Завантаженість і фінанси' },
  { to: '/admin/rooms', icon: '🛏️', title: 'Номери', text: 'Ціни, фото, доступність' },
  { to: '/admin/settings', icon: '⚙️', title: 'Налаштування', text: 'Бонуси, знижки, націнки' },
];

export function DashboardPage() {
  useDocumentTitle('Дашборд');
  const { user } = useAuth();
  const summary = useAsync(() => reportsApi.summary(), []);

  return (
    <>
      <PageHeader
        title={`Вітаємо, ${user?.full_name.split(' ')[0] ?? 'адміністраторе'}!`}
        subtitle={`Оперативна зведена інформація станом на ${formatLongDate(todayISO())}.`}
        actions={
          <button className="btn btn--outline" onClick={summary.reload} disabled={summary.loading}>
            Оновити
          </button>
        }
      />

      <AsyncContent data={summary.data} loading={summary.loading} error={summary.error} onRetry={summary.reload}>
        {(s) => (
          <div className="stat-grid">
            <StatTile
              accent
              label="Завантаженість сьогодні"
              value={formatPercent(s.occupancy_rate_today)}
              hint={`${s.occupied_today} з ${s.rooms_total} номерів зайнято`}
            />
            <StatTile label="Дохід цього місяця" value={formatMoney(s.revenue_this_month)} hint="за датою заїзду" />
            <StatTile label="Активні бронювання" value={formatNumber(s.active_bookings)} hint="підтверджені та заселені" />
            <StatTile label="Номерів у фонді" value={formatNumber(s.rooms_total)} />
            <StatTile label="Зайнято сьогодні" value={formatNumber(s.occupied_today)} />
            <StatTile label="Клієнтів" value={formatNumber(s.clients_total)} hint="зареєстрованих гостей" />
          </div>
        )}
      </AsyncContent>

      <div className="dashboard-quick">
        {QUICK_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="quick-link">
            <span className="quick-link__icon" aria-hidden>
              {l.icon}
            </span>
            <div>
              <strong>{l.title}</strong>
              <span>{l.text}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
