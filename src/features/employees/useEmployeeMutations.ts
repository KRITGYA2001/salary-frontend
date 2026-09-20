import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiPost } from '../../api/client';
import type {
  ChangeSalaryRequest,
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from '../../api/types';
import { employeeKeys } from './useEmployeeDetail';

/** Any employee change can affect lists, details, history and pay insights, so all are refetched. */
function useRefreshAfterChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['insights'] }),
    ]);
}

export function useCreateEmployee() {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: (request: CreateEmployeeRequest) => apiPost<Employee>('/employees', request),
    onSuccess: refresh,
  });
}

export function useUpdateEmployee(id: number) {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: (request: UpdateEmployeeRequest) => apiPatch<Employee>(`/employees/${id}`, request),
    onSuccess: refresh,
  });
}

export function useChangeSalary(id: number) {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: (request: ChangeSalaryRequest) => apiPost<Employee>(`/employees/${id}/salary`, request),
    onSuccess: refresh,
  });
}

export function useDeactivateEmployee(id: number) {
  const refresh = useRefreshAfterChange();
  return useMutation({
    mutationFn: () => apiPost<Employee>(`/employees/${id}/deactivate`),
    onSuccess: refresh,
  });
}
