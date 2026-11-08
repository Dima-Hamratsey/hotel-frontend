import type { ReactNode } from 'react';
import { ErrorState } from './ErrorState';
import { Loader } from './Loader';

interface AsyncContentProps<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingLabel?: string;
  /** Повертає true, якщо дані порожні — тоді показується `empty`. */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * Уніфікує обробку станів «завантаження / помилка / порожньо / дані».
 * Під час повторного завантаження показує попередні дані.
 */
export function AsyncContent<T>({
  data,
  loading,
  error,
  onRetry,
  loadingLabel,
  isEmpty,
  empty,
  children,
}: AsyncContentProps<T>) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (data === undefined) {
    return loading ? <Loader label={loadingLabel} /> : null;
  }
  if (isEmpty && empty && isEmpty(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}
