import { PageHeader } from '../../components/PageHeader';
import { CategoryReportCard } from '../../components/reports/CategoryReportCard';
import { OccupancyReportCard } from '../../components/reports/OccupancyReportCard';
import { RegularClientsCard } from '../../components/reports/RegularClientsCard';
import { RevenueReportCard } from '../../components/reports/RevenueReportCard';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function ReportsPage() {
  useDocumentTitle('Звіти');
  return (
    <>
      <PageHeader title="Звіти" subtitle="Завантаженість номерів, фінансові показники та постійні клієнти." />
      <div className="report-grid">
        <OccupancyReportCard />
        <RevenueReportCard />
        <CategoryReportCard />
        <RegularClientsCard />
      </div>
    </>
  );
}
