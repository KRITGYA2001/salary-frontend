import { useQuery } from '@tanstack/react-query';
import { apiGet } from './client';
import type { FilterOptions } from './types';

const FILTER_OPTIONS_STALE_MS = 10 * 60_000;

/** Countries, departments and job titles that feed every filter and form dropdown. */
export function useFilterOptions() {
  return useQuery({
    queryKey: ['meta', 'filters'],
    queryFn: ({ signal }) => apiGet<FilterOptions>('/meta/filters', undefined, signal),
    staleTime: FILTER_OPTIONS_STALE_MS,
  });
}
