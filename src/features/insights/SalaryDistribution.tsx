import { Box, Paper, Skeleton, Typography } from '@mui/material';
import type { SalaryBucket } from '../../api/types';
import { colors } from '../../theme/tokens';
import { formatUsd } from '../../utils/format';

interface SalaryDistributionProps {
  buckets: SalaryBucket[] | undefined;
}

const BAR_AREA_HEIGHT = 160;
const MIN_VISIBLE_BAR_PERCENT = 2;

const describeBucket = (bucket: SalaryBucket) =>
  `${formatUsd(bucket.fromUsd)} to ${formatUsd(bucket.toUsd)}: ${bucket.count.toLocaleString('en-US')} employees`;

export function SalaryDistribution({ buckets }: SalaryDistributionProps) {
  const tallest = Math.max(...(buckets ?? []).map((bucket) => bucket.count), 1);
  const isEmpty = buckets !== undefined && buckets.every((bucket) => bucket.count === 0);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography component="h2" variant="h2">
        Salary distribution
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Number of employees in each salary band
      </Typography>
      {buckets === undefined ? (
        <Skeleton variant="rounded" height={BAR_AREA_HEIGHT} />
      ) : isEmpty ? (
        <Typography>No active employees match this selection.</Typography>
      ) : (
        <>
          <Box
            component="ul"
            aria-label="Salary distribution"
            sx={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: BAR_AREA_HEIGHT, m: 0, p: 0, listStyle: 'none' }}
          >
            {buckets.map((bucket) => (
              <Box
                component="li"
                key={bucket.fromUsd}
                aria-label={describeBucket(bucket)}
                title={describeBucket(bucket)}
                sx={{
                  flex: 1,
                  height: `${bucket.count > 0 ? Math.max((bucket.count / tallest) * 100, MIN_VISIBLE_BAR_PERCENT) : 0}%`,
                  bgcolor: colors.accent,
                  borderRadius: '4px 4px 0 0',
                  '&:hover': { bgcolor: colors.accentHover },
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, color: 'text.secondary' }}>
            <Typography variant="caption">{formatUsd(buckets[0].fromUsd)}</Typography>
            <Typography variant="caption">{formatUsd(buckets[buckets.length - 1].toUsd)}</Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
