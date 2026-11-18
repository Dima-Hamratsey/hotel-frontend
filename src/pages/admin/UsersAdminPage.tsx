import { useMemo, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminUserOut, Role } from '../../api/types';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { AsyncContent } from '../../components/AsyncContent';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { LoyaltyBadge } from '../../components/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, formatMoney, formatNumber } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/labels';

type SortKey = 'created' | 'spent' | 'bookings';

export function UsersAdminPage() {
  useDocumentTitle('Користувачі');
  const { user: me } = useAuth();
  const users = useAsync(() => adminApi.users.list(), []);
  const roleAction = useAsyncAction();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | Role>('');
  const [sort, setSort] = useState<SortKey>('spent');
  const [pendingRole, setPendingRole] = useState<{ user: AdminUserOut; role: Role } | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (users.data ?? []).filter(
      (u) =>
        (!roleFilter || u.role === roleFilter) &&
        (!q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? '').includes(q)),
    );
    const sorters: Record<SortKey, (a: AdminUserOut, b: AdminUserOut) => number> = {
      created: (a, b) => b.created_at.localeCompare(a.created_at),
      spent: (a, b) => b.total_spent - a.total_spent,
      bookings: (a, b) => b.bookings_count - a.bookings_count,
    };
    return [...list].sort(sorters[sort]);
  }, [users.data, search, roleFilter, sort]);

  const confirmRole = async () => {
    if (!pendingRole) return;
    const { user, role } = pendingRole;
    const updated = await roleAction.run(
      () => adminApi.users.setRole(user.id, role),
      `${user.full_name}: роль змінено на «${ROLE_LABELS[role]}»`,
    );
    if (updated) {
      users.setData((list) => (list ?? []).map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    }
    setPendingRole(null);
  };

  const columns: Column<AdminUserOut>[] = [
    {
      key: 'user',
      header: 'Користувач',
      render: (u) => (
        <div>
          <strong>{u.full_name}</strong>
          <span className="cell-sub">{u.email}</span>
        </div>
      ),
    },
    { key: 'phone', header: 'Телефон', render: (u) => u.phone || '—' },
    { key: 'created', header: 'Реєстрація', render: (u) => formatDate(u.created_at) },
    { key: 'bookings', header: 'Бронювань', className: 'num', render: (u) => u.bookings_count },
    { key: 'spent', header: 'Витрачено', className: 'num', render: (u) => formatMoney(u.total_spent) },
    { key: 'bonus', header: 'Бонуси', className: 'num', render: (u) => formatNumber(u.bonus_points, 2) },
    { key: 'loyalty', header: 'Лояльність', render: (u) => <LoyaltyBadge level={u.loyalty_level} /> },
    {
      key: 'role',
      header: 'Роль',
      render: (u) => (
        <select
          className="select select--compact"
          value={u.role}
          disabled={u.id === me?.id || roleAction.pending}
          title={u.id === me?.id ? 'Не можна змінити власну роль' : undefined}
          onChange={(e) => setPendingRole({ user: u, role: e.target.value as Role })}
          aria-label={`Роль ${u.full_name}`}
        >
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Користувачі" subtitle="Клієнти та адміністратори, статистика бронювань і бонусів." />

      <div className="toolbar">
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="us-search">Пошук</label>
          <input
            id="us-search"
            className="input"
            placeholder="Ім’я, email або телефон"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="us-role">Роль</label>
          <select id="us-role" className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as '' | Role)}>
            <option value="">Усі</option>
            <option value="client">Клієнти</option>
            <option value="admin">Адміністратори</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="us-sort">Сортування</label>
          <select id="us-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="spent">За сумою витрат</option>
            <option value="bookings">За кількістю бронювань</option>
            <option value="created">Нові спочатку</option>
          </select>
        </div>
      </div>

      <AsyncContent
        data={users.data}
        loading={users.loading}
        error={users.error}
        onRetry={users.reload}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState icon="👥" title="Користувачів ще немає" />}
      >
        {() =>
          rows.length ? (
            <DataTable pageSize={25} rows={rows} columns={columns} rowKey={(u) => u.id} />
          ) : (
            <EmptyState icon="🔍" title="Нікого не знайдено" />
          )
        }
      </AsyncContent>

      <ConfirmDialog
        open={Boolean(pendingRole)}
        title="Змінити роль?"
        pending={roleAction.pending}
        onClose={() => setPendingRole(null)}
        onConfirm={confirmRole}
        message={
          pendingRole && (
            <>
              Користувач <strong>{pendingRole.user.full_name}</strong> отримає роль «{ROLE_LABELS[pendingRole.role]}».
              {pendingRole.role === 'admin' && ' Адміністратор має повний доступ до панелі керування.'}
            </>
          )
        }
      />
    </>
  );
}
