import { Alert, Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { SalaryHistoryEntry } from '../../api/types';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/tokens';
import { formatChangePercent, formatDate, formatMoney } from '../../utils/format';

const SKELETON_ENTRY_COUNT = 3;

function HistoryEntry({ entry }: { entry: SalaryHistoryEntry }) {
  const change = formatChangePercent(entry.oldSalary, entry.newSalary);
  const isRaise = entry.oldSalary !== null && entry.newSalary > entry.oldSalary;
  return (
    <Box
      component="li"
      sx={{ display: 'grid', gap: 0.5, py: 2, borderTop: `1px solid ${colors.line}`, '&:first-of-type': { borderTop: 0 } }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {entry.oldSalary === null
            ? `Started at ${formatMoney(entry.newSalary, entry.currency)}`
            : `${formatMoney(entry.oldSalary, entry.currency)} to ${formatMoney(entry.newSalary, entry.currency)}`}
          {change && (
            <Box component="span" sx={{ ml: 1, color: isRaise ? colors.accent : colors.danger, fontWeight: 600 }}>
              {change}
            </Box>
          )}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Effective {formatDate(entry.effectiveDate)}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {entry.reason}
      </Typography>
    </Box>
  );
}

export function SalaryHistoryPanel({ history }: { history: UseQueryResult<SalaryHistoryEntry[]> }) {
  if (history.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => history.refetch()}>
            Retry
          </Button>
        }
      >
        Salary history could not be loaded.
      </Alert>
    );
  }

  if (history.isPending) {
    return (
      <Paper sx={{ p: 3 }} aria-busy="true">
        {Array.from({ length: SKELETON_ENTRY_COUNT }, (_, index) => (
          <Box key={index} sx={{ py: 1.5 }}>
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="text" width="70%" />
          </Box>
        ))}
      </Paper>
    );
  }

  if (history.data.length === 0) {
    return (
      <EmptyState
        icon={ClockCounterClockwise}
        title="No salary changes yet"
        description="Changes appear here, newest first, once this salary is revised."
      />
    );
  }

  return (
    <Paper sx={{ px: 3 }}>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }} aria-label="Salary history">
        {history.data.map((entry) => (
          <HistoryEntry key={entry.id} entry={entry} />
        ))}
      </Box>
    </Paper>
  );
}
