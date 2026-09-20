import { Box, Button, InputAdornment, MenuItem, TextField } from '@mui/material';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import type { FilterOptions } from '../../api/types';
import { useDebouncedValue } from '../../utils/useDebouncedValue';
import { DEFAULT_FILTERS, type EmployeeFilters, SEARCH_DEBOUNCE_MS } from './employeeFilters';

interface EmployeeFilterBarProps {
  filters: EmployeeFilters;
  options: FilterOptions | undefined;
  onChange: (changes: Partial<EmployeeFilters>) => void;
}

const ANY = '';

export function EmployeeFilterBar({ filters, options, onChange }: EmployeeFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ search: debouncedSearch });
    }
    // Only a settled search term should push to the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const jobTitles = useMemo(
    () =>
      (options?.jobTitles ?? []).filter(
        (title) => !filters.department || String(title.departmentId) === filters.department,
      ),
    [options, filters.department],
  );

  const hasActiveFilters =
    filters.search !== '' ||
    filters.country !== '' ||
    filters.department !== '' ||
    filters.jobTitle !== '' ||
    filters.status !== '';

  const clearFilters = () => {
    setSearchInput('');
    onChange({
      search: DEFAULT_FILTERS.search,
      country: DEFAULT_FILTERS.country,
      department: DEFAULT_FILTERS.department,
      jobTitle: DEFAULT_FILTERS.jobTitle,
      status: DEFAULT_FILTERS.status,
    });
  };

  return (
    <Box
      component="form"
      role="search"
      aria-label="Filter employees"
      onSubmit={(event) => event.preventDefault()}
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: '2fr repeat(4, 1fr) auto' },
        alignItems: 'center',
        mb: 3,
      }}
    >
      <TextField
        size="small"
        label="Search"
        placeholder="Name, code or email"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={18} aria-hidden />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        size="small"
        label="Country"
        value={filters.country}
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
        value={filters.department}
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
        value={filters.jobTitle}
        onChange={(event) => onChange({ jobTitle: event.target.value })}
      >
        <MenuItem value={ANY}>All job titles</MenuItem>
        {jobTitles.map((title) => (
          <MenuItem key={title.id} value={String(title.id)}>
            {title.title}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Status"
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value as EmployeeFilters['status'] })}
      >
        <MenuItem value={ANY}>Any status</MenuItem>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </TextField>
      <Button
        variant="text"
        color="inherit"
        startIcon={<X size={16} aria-hidden />}
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Clear
      </Button>
    </Box>
  );
}
