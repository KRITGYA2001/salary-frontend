import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiGet, type QueryParams } from '../../api/client';
import type { Employee, GroupSalaryStats, SalaryBucket, SalaryStats } from '../../api/types';

export const INSIGHTS_KEY = 'insights';
export const TOP_LIMIT = 5;

export type InsightDimension = 'country' | 'department' | 'jobTitle';

export interface InsightScope {
  country: string;
  department: string;
  jobTitle: string;
}

export const DIMENSIONS: readonly { value: InsightDimension; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'department', label: 'Department' },
  { value: 'jobTitle', label: 'Job title' },
];

const toParams = (scope: InsightScope, extra: QueryParams = {}): QueryParams => ({
  country: scope.country || undefined,
  department: scope.department || undefined,
  jobTitle: scope.jobTitle || undefined,
  ...extra,
});

function useInsight<T>(path: string, scope: InsightScope, extra?: QueryParams) {
  const params = toParams(scope, extra);
  return useQuery({
    queryKey: [INSIGHTS_KEY, path, params],
    queryFn: ({ signal }) => apiGet<T>(`/insights/${path}`, params, signal),
    placeholderData: keepPreviousData,
  });
}

export const useSalarySummary = (scope: InsightScope) => useInsight<SalaryStats>('summary', scope);

export const useGroupStats = (dimension: InsightDimension, scope: InsightScope) =>
  useInsight<GroupSalaryStats[]>(`by/${dimension}`, scope);

export const useDistribution = (scope: InsightScope) => useInsight<SalaryBucket[]>('distribution', scope);

export const useTopEarners = (direction: 'highest' | 'lowest', scope: InsightScope) =>
  useInsight<Employee[]>('top', scope, { direction, limit: TOP_LIMIT });
