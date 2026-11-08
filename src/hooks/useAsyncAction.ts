import { useCallback, useState } from 'react';
import { errorMessage } from '../api/http';
import { useToast } from './useToast';

/**
 * Обгортка для мутацій (кнопки «Зберегти», «Скасувати» тощо):
 * тримає прапорець pending і показує результат/помилку тостом.
 */
export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const run = useCallback(
    async <T,>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> => {
      setPending(true);
      try {
        const result = await action();
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (err) {
        toast.error(errorMessage(err));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [toast],
  );

  return { pending, run };
}
