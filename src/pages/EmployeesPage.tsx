import { Alert, Button } from '@mui/material';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useFilterOptions } from '../api/meta';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { EmployeeFilterBar } from '../features/employees/EmployeeFilterBar';
import { EmployeeTable } from '../features/employees/EmployeeTable';
import { useEmployeeFilters } from '../features/employees/useEmployeeFilters';
import { useEmployees } from '../features/employees/useEmployees';

export function EmployeesPage() {
  const { filters, updateFilters } = useEmployeeFilters();
  const options = useFilterOptions();
  const employees = useEmployees(filters);

  const isEmpty = employees.data !== undefined && employees.data.totalItems === 0;

  return (
    <>
      <PageHeader
        title="Employees"
        description="Find anyone, compare pay across countries and keep every salary change on record."
      />
      <EmployeeFilterBar filters={filters} options={options.data} onChange={updateFilters} />
      {employees.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => employees.refetch()}>
              Retry
            </Button>
          }
        >
          Employees could not be loaded. Check your connection and try again.
        </Alert>
      ) : isEmpty ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No employees match"
          description="Try a different name or remove a filter to widen the search."
        />
      ) : (
        <EmployeeTable
          page={employees.data}
          filters={filters}
          loading={employees.isPending}
          refreshing={employees.isPlaceholderData}
          onChange={updateFilters}
        />
      )}
    </>
  );
}
