interface LoaderProps {
  label?: string;
  /** Займає всю висоту області (для сторінок). */
  page?: boolean;
  inline?: boolean;
}

export function Loader({ label = 'Завантаження…', page, inline }: LoaderProps) {
  if (inline) {
    return <span className="spinner spinner--sm" aria-label={label} />;
  }
  return (
    <div className={page ? 'loader loader--page' : 'loader'} role="status">
      <span className="spinner" />
      <span className="loader__label">{label}</span>
    </div>
  );
}
