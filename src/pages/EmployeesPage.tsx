import { Alert, Button, Stack } from '@mui/material';
import { DownloadSimple, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../components/Notifications';
import { useFilterOptions } from '../api/meta';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { EmployeeFormDialog } from '../features/employees/EmployeeFormDialog';
import { EmployeeFilterBar } from '../features/employees/EmployeeFilterBar';
import { EmployeeTable } from '../features/employees/EmployeeTable';
import { toExportUrl } from '../features/employees/employeeFilters';
import { useEmployeeFilters } from '../features/employees/useEmployeeFilters';
import { useEmployees } from '../features/employees/useEmployees';

export function EmployeesPage() {
  const { filters, updateFilters } = useEmployeeFilters();
  const options = useFilterOptions();
  const employees = useEmployees(filters);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  const isEmpty = employees.data !== undefined && employees.data.totalItems === 0;

  return (
    <>
      <PageHeader
        title="Employees"
        description="Find anyone, compare pay across countries and keep every salary change on record."
        actions={
          <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="inherit"
              component="a"
              href={toExportUrl(filters)}
              download
              startIcon={<DownloadSimple size={18} aria-hidden />}
            >
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<Plus size={18} aria-hidden />} onClick={() => setIsAdding(true)}>
              Add employee
            </Button>
          </Stack>
        }
      />
      {isAdding && (
        <EmployeeFormDialog
          open
          options={options.data}
          onClose={() => setIsAdding(false)}
          onSaved={(created) => {
            setIsAdding(false);
            notify(`${created.fullName} was added`);
            navigate(`/employees/${created.id}`);
          }}
        />
      )}
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
