import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { ServicesList } from '../../components/ServicesList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function ServicesPage() {
  useDocumentTitle('Послуги');
  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Для гостей"
          title="Додаткові послуги"
          subtitle="Оберіть послуги під час бронювання номера — їх вартість автоматично додасться до розрахунку."
          actions={
            <Link to="/rooms" className="btn btn--dark">
              Обрати номер
            </Link>
          }
        />
        <ServicesList />
      </div>
    </div>
  );
}
