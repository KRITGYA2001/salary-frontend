import { Alert, Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { ArrowLeft, CurrencyCircleDollar, PencilSimple, UserCircle, UserMinus } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import type { Employee } from '../api/types';
import { useFilterOptions } from '../api/meta';
import { useNotify } from '../components/Notifications';
import { EmptyState } from '../components/EmptyState';
import { ChangeSalaryDialog } from '../features/employees/ChangeSalaryDialog';
import { DeactivateDialog } from '../features/employees/DeactivateDialog';
import { EmployeeFormDialog } from '../features/employees/EmployeeFormDialog';
import { SalaryHistoryPanel } from '../features/employees/SalaryHistoryPanel';
import { useEmployee, useSalaryHistory } from '../features/employees/useEmployeeDetail';
import { colors } from '../theme/tokens';
import { formatDate, formatEmploymentType, formatMoney, formatUsd } from '../utils/format';

const HTTP_NOT_FOUND = 404;

function BackLink() {
  return (
    <Button
      component={RouterLink}
      to="/employees"
      color="inherit"
      startIcon={<ArrowLeft size={16} aria-hidden />}
      sx={{ mb: 2, ml: -1 }}
    >
      All employees
    </Button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

function EmployeeOverview({ employee }: { employee: Employee }) {
  const isActive = employee.status === 'ACTIVE';
  const history = useSalaryHistory(employee.id);
  const options = useFilterOptions();
  const notify = useNotify();
  const [dialog, setDialog] = useState<'edit' | 'salary' | 'deactivate' | null>(null);
  const closeDialog = () => setDialog(null);
  const finish = (message: string) => () => {
    closeDialog();
    notify(message);
  };
  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography component="h1" variant="h1">
          {employee.fullName}
        </Typography>
        <Chip
          size="small"
          label={isActive ? 'Active' : 'Inactive'}
          sx={{
            bgcolor: isActive ? colors.accentSoft : colors.paperDeep,
            color: isActive ? colors.accent : colors.inkMuted,
            fontWeight: 600,
          }}
        />
      </Stack>
      <Typography sx={{ color: 'text.secondary', mb: 2 }}>
        {employee.jobTitle}, {employee.department} · {employee.employeeCode}
      </Typography>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 4 }}>
        {isActive && (
          <Button
            variant="contained"
            startIcon={<CurrencyCircleDollar size={18} aria-hidden />}
            onClick={() => setDialog('salary')}
          >
            Change salary
          </Button>
        )}
        <Button variant="outlined" startIcon={<PencilSimple size={18} aria-hidden />} onClick={() => setDialog('edit')}>
          Edit details
        </Button>
        {isActive && (
          <Button color="inherit" startIcon={<UserMinus size={18} aria-hidden />} onClick={() => setDialog('deactivate')}>
            Deactivate
          </Button>
        )}
      </Stack>
      {dialog === 'edit' && (
        <EmployeeFormDialog
          open
          employee={employee}
          options={options.data}
          onClose={closeDialog}
          onSaved={finish('Employee details saved')}
        />
      )}
      {dialog === 'salary' && (
        <ChangeSalaryDialog open employee={employee} onClose={closeDialog} onSaved={finish('Salary updated')} />
      )}
      {dialog === 'deactivate' && (
        <DeactivateDialog open employee={employee} onClose={closeDialog} onDone={finish('Employee deactivated')} />
      )}

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, alignItems: 'start' }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Annual salary
          </Typography>
          <Typography
            sx={{ fontSize: '2rem', fontWeight: 650, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
          >
            {formatMoney(employee.salary, employee.currency)}
          </Typography>
          {employee.currency !== 'USD' && (
            <Typography sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
              {formatUsd(employee.salaryUsd)} in US dollars
            </Typography>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3, pt: 3, borderTop: `1px solid ${colors.line}` }}>
            <Fact label="Country" value={employee.countryName} />
            <Fact label="Currency" value={employee.currency} />
            <Fact label="Employment" value={formatEmploymentType(employee.employmentType)} />
            <Fact label="Hired" value={formatDate(employee.hireDate)} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Fact label="Email" value={employee.email} />
            </Box>
          </Box>
        </Paper>
        <Box component="section" aria-labelledby="salary-history-heading">
          <Typography id="salary-history-heading" component="h2" variant="h2" sx={{ mb: 1.5 }}>
            Salary history
          </Typography>
          <SalaryHistoryPanel history={history} />
        </Box>
      </Box>
    </>
  );
}

function OverviewSkeleton() {
  return (
    <Box aria-busy="true">
      <Skeleton variant="text" width={280} height={48} />
      <Skeleton variant="text" width={220} sx={{ mb: 4 }} />
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' } }}>
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={260} />
      </Box>
    </Box>
  );
}

export function EmployeeDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const employee = useEmployee(id);

  let content;
  if (!Number.isInteger(id) || (employee.error instanceof ApiError && employee.error.status === HTTP_NOT_FOUND)) {
    content = (
      <EmptyState
        icon={UserCircle}
        title="Employee not found"
        description="This employee does not exist or the link is out of date."
      />
    );
  } else if (employee.isError) {
    content = (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => employee.refetch()}>
            Retry
          </Button>
        }
      >
        This employee could not be loaded. Check your connection and try again.
      </Alert>
    );
  } else if (employee.isPending) {
    content = <OverviewSkeleton />;
  } else {
    content = <EmployeeOverview employee={employee.data} />;
  }

  return (
    <>
      <BackLink />
      {content}
    </>
  );
}
