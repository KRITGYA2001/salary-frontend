import { Box, Paper, Skeleton, Typography } from '@mui/material';
import type { SalaryStats } from '../../api/types';
import { formatUsd } from '../../utils/format';

interface SummaryCardsProps {
  stats: SalaryStats | undefined;
}

const NO_DATA = '-';

const money = (amount: number | null | undefined) =>
  amount === null || amount === undefined ? NO_DATA : formatUsd(amount);

export function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    { label: 'Active employees', value: stats ? stats.headcount.toLocaleString('en-US') : undefined },
    { label: 'Average salary', value: stats ? money(stats.averageUsd) : undefined },
    { label: 'Median salary', value: stats ? money(stats.medianUsd) : undefined },
    { label: '90th percentile', value: stats ? money(stats.p90Usd) : undefined },
    { label: 'Range', value: stats ? `${money(stats.minUsd)} to ${money(stats.maxUsd)}` : undefined },
  ];

  return (
    <Box
      component="dl"
      sx={{
        display: 'grid',
        gap: 2,
        m: 0,
        mb: 3,
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', xl: 'repeat(5, 1fr)' },
      }}
    >
      {cards.map((card) => (
        <Paper key={card.label} sx={{ p: 2.5 }}>
          <Typography component="dt" variant="body2" sx={{ color: 'text.secondary' }}>
            {card.label}
          </Typography>
          <Typography component="dd" sx={{ m: 0, mt: 0.5, fontSize: '1.375rem', fontWeight: 600 }}>
            {card.value ?? <Skeleton width={90} />}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
