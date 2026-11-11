import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Сторінку не знайдено');
  return (
    <div className="page">
      <div className="container">
        <EmptyState
          icon="🧭"
          title="Сторінку не знайдено"
          text="Можливо, посилання застаріло або сторінку було переміщено."
          action={
            <Link to="/" className="btn btn--dark">
              На головну
            </Link>
          }
        />
      </div>
    </div>
  );
}
