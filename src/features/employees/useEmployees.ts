import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import type { Employee, PageResponse } from '../../api/types';
import { type EmployeeFilters, toApiParams } from './employeeFilters';

/** Fetches one page of employees; keeps the previous page on screen while the next loads. */
export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', 'list', toApiParams(filters)],
    queryFn: ({ signal }) => apiGet<PageResponse<Employee>>('/employees', toApiParams(filters), signal),
    placeholderData: keepPreviousData,
  });
}
