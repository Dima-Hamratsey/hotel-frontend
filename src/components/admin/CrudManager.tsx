import { useState, type FormEvent, type ReactNode } from 'react';
import type { CrudResource } from '../../api/admin';
import { errorMessage } from '../../api/http';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import { AsyncContent } from '../AsyncContent';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyState } from '../EmptyState';
import { Modal } from '../Modal';
import { PageHeader } from '../PageHeader';
import { DataTable, type Column } from './DataTable';

export interface FormRenderProps<TIn> {
  value: TIn;
  set: <K extends keyof TIn>(key: K, v: TIn[K]) => void;
}

interface CrudManagerProps<TOut extends { id: number }, TIn> {
  resource: CrudResource<TOut, TIn>;
  title: string;
  subtitle?: string;
  /** Назва сутності в знахідному відмінку: «категорію», «послугу»… */
  entityAccusative: string;
  columns: Column<TOut>[];
  emptyForm: TIn;
  toForm: (item: TOut) => TIn;
  renderForm: (props: FormRenderProps<TIn>) => ReactNode;
  validate?: (value: TIn) => string | null;
  describe: (item: TOut) => string;
  modalSize?: 'sm' | 'md' | 'lg';
}

/**
 * Узагальнений CRUD-екран (Template Method на рівні UI): таблиця + модальна
 * форма створення/редагування + підтвердження видалення. Специфіка сутності
 * передається через колонки та renderForm.
 */
export function CrudManager<TOut extends { id: number }, TIn>({
  resource,
  title,
  subtitle,
  entityAccusative,
  columns,
  emptyForm,
  toForm,
  renderForm,
  validate,
  describe,
  modalSize = 'md',
}: CrudManagerProps<TOut, TIn>) {
  const toast = useToast();
  const list = useAsync(() => resource.list(), [resource]);

  const [editing, setEditing] = useState<TOut | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<TIn>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<TOut | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (item: TOut) => {
    setEditing(item);
    setForm(toForm(item));
    setFormError(null);
    setFormOpen(true);
  };

  const set = <K extends keyof TIn>(key: K, v: TIn[K]) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validate?.(form) ?? null;
    if (problem) {
      setFormError(problem);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const updated = await resource.update(editing.id, form);
        list.setData((items) => (items ?? []).map((i) => (i.id === updated.id ? updated : i)));
        toast.success('Зміни збережено');
      } else {
        const created = await resource.create(form);
        list.setData((items) => [...(items ?? []), created]);
        toast.success('Запис створено');
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const target = toDelete;
    setDeleting(true);
    setDeleteError(null);
    try {
      await resource.remove(target.id);
      list.setData((items) => (items ?? []).filter((i) => i.id !== target.id));
      toast.success('Запис видалено');
      setToDelete(null);
    } catch (err) {
      // Напр. 400 «є пов’язані бронювання» — показуємо в самому діалозі.
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const askDelete = (item: TOut) => {
    setDeleteError(null);
    setToDelete(item);
  };

  const allColumns: Column<TOut>[] = [
    ...columns,
    {
      key: '__actions',
      header: '',
      className: 'actions-col',
      render: (row) => (
        <div className="btn-row table-actions">
          <button className="btn btn--outline btn--sm" onClick={() => openEdit(row)}>
            Редагувати
          </button>
          <button className="btn btn--danger-outline btn--sm" onClick={() => askDelete(row)}>
            Видалити
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <button className="btn btn--primary" onClick={openCreate}>
            + Додати {entityAccusative}
          </button>
        }
      />

      <AsyncContent
        data={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            title="Записів ще немає"
            action={
              <button className="btn btn--dark" onClick={openCreate}>
                Додати {entityAccusative}
              </button>
            }
          />
        }
      >
        {(rows) => <DataTable rows={rows} columns={allColumns} rowKey={(r) => r.id} />}
      </AsyncContent>

      <Modal
        open={formOpen}
        title={editing ? `Редагувати ${entityAccusative}` : `Додати ${entityAccusative}`}
        onClose={() => !saving && setFormOpen(false)}
        size={modalSize}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          {renderForm({ value: form, set })}
          {formError && <div className="alert alert--error">{formError}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn--outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Скасувати
            </button>
            <button type="submit" className="btn btn--dark" disabled={saving}>
              {saving ? 'Збереження…' : 'Зберегти'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Видалити запис?"
        danger
        pending={deleting}
        confirmLabel="Видалити"
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        message={
          toDelete && (
            <>
              <p>«{describe(toDelete)}» буде видалено без можливості відновлення.</p>
              {deleteError && <div className="alert alert--error">{deleteError}</div>}
            </>
          )
        }
      />
    </>
  );
}
