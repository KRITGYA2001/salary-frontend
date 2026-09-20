import { Alert, Box, Button } from '@mui/material';
import { useState } from 'react';
import { useFilterOptions } from '../api/meta';
import { PageHeader } from '../components/PageHeader';
import { GroupBreakdown } from '../features/insights/GroupBreakdown';
import { InsightsFilterBar } from '../features/insights/InsightsFilterBar';
import { SalaryDistribution } from '../features/insights/SalaryDistribution';
import { SummaryCards } from '../features/insights/SummaryCards';
import { TopEarners } from '../features/insights/TopEarners';
import {
  type InsightDimension,
  type InsightScope,
  useDistribution,
  useGroupStats,
  useSalarySummary,
  useTopEarners,
} from '../features/insights/useInsights';

const ALL: InsightScope = { country: '', department: '', jobTitle: '' };

export function InsightsPage() {
  const [scope, setScope] = useState<InsightScope>(ALL);
  const [dimension, setDimension] = useState<InsightDimension>('country');
  const options = useFilterOptions();
  const summary = useSalarySummary(scope);
  const groups = useGroupStats(dimension, scope);
  const distribution = useDistribution(scope);
  const highest = useTopEarners('highest', scope);
  const lowest = useTopEarners('lowest', scope);

  const queries = [summary, groups, distribution, highest, lowest];
  const hasError = queries.some((query) => query.isError);

  return (
    <>
      <PageHeader
        title="Insights"
        description="See how pay is distributed by country, department and role, all in US dollars."
      />
      <InsightsFilterBar
        scope={scope}
        options={options.data}
        onChange={(changes) => setScope((previous) => ({ ...previous, ...changes }))}
      />
      {hasError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => queries.filter((query) => query.isError).forEach((query) => query.refetch())}
            >
              Retry
            </Button>
          }
        >
          Some insights could not be loaded. Check your connection and try again.
        </Alert>
      )}
      <SummaryCards stats={summary.data} />
      <GroupBreakdown dimension={dimension} onDimensionChange={setDimension} groups={groups.data} />
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr 2fr' } }}>
        <SalaryDistribution buckets={distribution.data} />
        <TopEarners title="Highest paid" employees={highest.data} />
        <TopEarners title="Lowest paid" employees={lowest.data} />
      </Box>
    </>
  );
}
