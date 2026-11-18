import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  text?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h4 className="empty-state__title">{title}</h4>
      {text && <p className="empty-state__text">{text}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
