import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import type { Employee, SalaryHistoryEntry } from '../../api/types';

export const employeeKeys = {
  all: ['employees'] as const,
  detail: (id: number) => ['employees', 'detail', id] as const,
  history: (id: number) => ['employees', 'history', id] as const,
};

export function useEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: ({ signal }) => apiGet<Employee>(`/employees/${id}`, undefined, signal),
    enabled: Number.isInteger(id),
  });
}

export function useSalaryHistory(id: number) {
  return useQuery({
    queryKey: employeeKeys.history(id),
    queryFn: ({ signal }) => apiGet<SalaryHistoryEntry[]>(`/employees/${id}/salary-history`, undefined, signal),
    enabled: Number.isInteger(id),
  });
}
