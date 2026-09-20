import { ChartBar } from '@phosphor-icons/react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';

export function InsightsPage() {
  return (
    <>
      <PageHeader
        title="Insights"
        description="See how pay is distributed by country, department and role, all in US dollars."
      />
      <EmptyState
        icon={ChartBar}
        title="Pay insights are coming soon"
        description="Averages, medians and salary ranges will appear here once the dashboard is built."
      />
    </>
  );
}
