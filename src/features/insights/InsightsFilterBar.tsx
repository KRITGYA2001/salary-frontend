import { Box, Button, MenuItem, TextField } from '@mui/material';
import { X } from '@phosphor-icons/react';
import { useMemo } from 'react';
import type { FilterOptions } from '../../api/types';
import type { InsightScope } from './useInsights';

interface InsightsFilterBarProps {
  scope: InsightScope;
  options: FilterOptions | undefined;
  onChange: (changes: Partial<InsightScope>) => void;
}

const ANY = '';

export function InsightsFilterBar({ scope, options, onChange }: InsightsFilterBarProps) {
  const jobTitles = useMemo(
    () =>
      (options?.jobTitles ?? []).filter(
        (title) => !scope.department || String(title.departmentId) === scope.department,
      ),
    [options, scope.department],
  );
  const isFiltered = scope.country !== ANY || scope.department !== ANY || scope.jobTitle !== ANY;

  return (
    <Box
      role="search"
      aria-label="Filter insights"
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr) auto' },
        alignItems: 'center',
        mb: 3,
      }}
    >
      <TextField
        select
        size="small"
        label="Country"
        value={scope.country}
        onChange={(event) => onChange({ country: event.target.value })}
      >
        <MenuItem value={ANY}>All countries</MenuItem>
        {options?.countries.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            {country.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Department"
        value={scope.department}
        onChange={(event) => onChange({ department: event.target.value, jobTitle: ANY })}
      >
        <MenuItem value={ANY}>All departments</MenuItem>
        {options?.departments.map((department) => (
          <MenuItem key={department.id} value={String(department.id)}>
            {department.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Job title"
        value={scope.jobTitle}
        onChange={(event) => onChange({ jobTitle: event.target.value })}
      >
        <MenuItem value={ANY}>All job titles</MenuItem>
        {jobTitles.map((title) => (
          <MenuItem key={title.id} value={String(title.id)}>
            {title.title}
          </MenuItem>
        ))}
      </TextField>
      {isFiltered && (
        <Button
          color="inherit"
          startIcon={<X size={16} aria-hidden />}
          onClick={() => onChange({ country: ANY, department: ANY, jobTitle: ANY })}
        >
          Clear
        </Button>
      )}
    </Box>
  );
}
