import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type EmployeeFilters, parseFilters, toSearchParams } from './employeeFilters';

/**
 * Filters live in the URL so views can be bookmarked and shared.
 * Any change other than paging itself returns to the first page.
 */
export function useEmployeeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const updateFilters = useCallback(
    (changes: Partial<EmployeeFilters>) => {
      const resetsPage = Object.keys(changes).some((key) => key !== 'page');
      setSearchParams(toSearchParams({ ...filters, ...(resetsPage ? { page: 0 } : {}), ...changes }), {
        replace: true,
      });
    },
    [filters, setSearchParams],
  );

  return { filters, updateFilters };
}
