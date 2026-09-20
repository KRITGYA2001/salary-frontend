import {
  Box,
  Paper,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import type { GroupSalaryStats } from '../../api/types';
import { colors } from '../../theme/tokens';
import { formatUsd } from '../../utils/format';
import { DIMENSIONS, type InsightDimension } from './useInsights';

interface GroupBreakdownProps {
  dimension: InsightDimension;
  onDimensionChange: (dimension: InsightDimension) => void;
  groups: GroupSalaryStats[] | undefined;
}

const MAX_ROWS = 12;
const SKELETON_ROWS = 6;
const COLUMN_COUNT = 5;

const byAverageDescending = (a: GroupSalaryStats, b: GroupSalaryStats) =>
  (b.stats.averageUsd ?? 0) - (a.stats.averageUsd ?? 0);

export function GroupBreakdown({ dimension, onDimensionChange, groups }: GroupBreakdownProps) {
  const rows = groups
    ?.filter((group) => group.stats.headcount > 0)
    .sort(byAverageDescending)
    .slice(0, MAX_ROWS);
  const highest = Math.max(...(rows ?? []).map((group) => group.stats.averageUsd ?? 0), 1);
  const dimensionLabel = DIMENSIONS.find((entry) => entry.value === dimension)?.label ?? '';

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ px: 2.5, pt: 2.5 }}>
        <Typography component="h2" variant="h2">
          Average salary by
        </Typography>
        <Tabs
          value={dimension}
          onChange={(_, value: InsightDimension) => onDimensionChange(value)}
          aria-label="Group salaries by"
          sx={{ mt: 1 }}
        >
          {DIMENSIONS.map((entry) => (
            <Tab key={entry.value} value={entry.value} label={entry.label} />
          ))}
        </Tabs>
      </Box>
      <TableContainer>
        <Table size="small" aria-label={`Salary by ${dimensionLabel.toLowerCase()}`}>
          <TableHead>
            <TableRow>
              <TableCell>{dimensionLabel}</TableCell>
              <TableCell align="right">Employees</TableCell>
              <TableCell sx={{ width: { md: '32%' } }}>Average</TableCell>
              <TableCell align="right">Median</TableCell>
              <TableCell align="right">Range</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows === undefined &&
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={COLUMN_COUNT}>
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))}
            {rows?.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT}>No active employees match this selection.</TableCell>
              </TableRow>
            )}
            {rows?.map((group) => {
              const average = group.stats.averageUsd ?? 0;
              return (
                <TableRow key={group.key} hover>
                  <TableCell>{group.label}</TableCell>
                  <TableCell align="right">{group.stats.headcount.toLocaleString('en-US')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: colors.paperDeep }} aria-hidden>
                        <Box
                          sx={{
                            width: `${(average / highest) * 100}%`,
                            height: '100%',
                            borderRadius: 1,
                            bgcolor: colors.accent,
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 72, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatUsd(average)}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatUsd(group.stats.medianUsd ?? 0)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatUsd(group.stats.minUsd ?? 0)} to {formatUsd(group.stats.maxUsd ?? 0)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
