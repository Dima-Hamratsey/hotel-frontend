interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden>
        ⚠️
      </div>
      <div className="error-state__body">
        <strong>Не вдалося завантажити дані</strong>
        <p className="error-state__msg">{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn--outline btn--sm" onClick={onRetry}>
          Спробувати знову
        </button>
      )}
    </div>
  );
}
