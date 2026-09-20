import { Box, Link, Paper, Skeleton, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { Employee } from '../../api/types';
import { formatUsd } from '../../utils/format';

interface TopEarnersProps {
  title: string;
  employees: Employee[] | undefined;
}

export function TopEarners({ title, employees }: TopEarnersProps) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography component="h2" variant="h2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {employees === undefined ? (
        <Skeleton variant="rounded" height={120} />
      ) : employees.length === 0 ? (
        <Typography>No active employees match this selection.</Typography>
      ) : (
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
          {employees.map((employee) => (
            <Box
              component="li"
              key={employee.id}
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline' }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Link component={RouterLink} to={`/employees/${employee.id}`} underline="hover" color="inherit">
                  {employee.fullName}
                </Link>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {employee.jobTitle}, {employee.countryName}
                </Typography>
              </Box>
              <Typography sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {formatUsd(employee.salaryUsd)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
