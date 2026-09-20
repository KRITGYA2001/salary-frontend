import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { type FormEvent, useMemo, useState } from 'react';
import type { CreateEmployeeRequest, Employee, EmploymentType, FilterOptions } from '../../api/types';
import { todayIso } from '../../utils/format';
import { type FieldErrors, fieldErrorsOf, formErrorMessage, parseAmount, REQUIRED_MESSAGE } from './formErrors';
import { useCreateEmployee, useUpdateEmployee } from './useEmployeeMutations';

interface EmployeeFormDialogProps {
  open: boolean;
  options: FilterOptions | undefined;
  /** When set the dialog edits this employee; otherwise it hires a new one. */
  employee?: Employee;
  onClose: () => void;
  onSaved: (employee: Employee) => void;
}

interface FormValues {
  fullName: string;
  email: string;
  countryCode: string;
  departmentId: string;
  jobTitleId: string;
  employmentType: EmploymentType;
  salary: string;
  hireDate: string;
}

const EMPLOYMENT_TYPES: readonly { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'CONTRACT', label: 'Contract' },
];

function initialValues(employee?: Employee): FormValues {
  return {
    fullName: employee?.fullName ?? '',
    email: employee?.email ?? '',
    countryCode: employee?.countryCode ?? '',
    departmentId: employee ? String(employee.departmentId) : '',
    jobTitleId: employee ? String(employee.jobTitleId) : '',
    employmentType: employee?.employmentType ?? 'FULL_TIME',
    salary: '',
    hireDate: todayIso(),
  };
}

function requiredFields(isEdit: boolean): (keyof FormValues)[] {
  const shared: (keyof FormValues)[] = ['fullName', 'email', 'departmentId', 'jobTitleId'];
  return isEdit ? shared : [...shared, 'countryCode', 'salary', 'hireDate'];
}

/** Hire form and edit form share one dialog; salary and country are only set when hiring. */
export function EmployeeFormDialog({ open, options, employee, onClose, onSaved }: EmployeeFormDialogProps) {
  const isEdit = employee !== undefined;
  const [values, setValues] = useState<FormValues>(() => initialValues(employee));
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const create = useCreateEmployee();
  const update = useUpdateEmployee(employee?.id ?? 0);
  const mutation = isEdit ? update : create;

  const serverErrors = fieldErrorsOf(mutation.error);
  const errors: FieldErrors = { ...serverErrors, ...clientErrors };
  const formMessage = formErrorMessage(mutation.error);

  const country = options?.countries.find((candidate) => candidate.code === values.countryCode);
  const jobTitles = useMemo(
    () => (options?.jobTitles ?? []).filter((title) => String(title.departmentId) === values.departmentId),
    [options, values.departmentId],
  );

  const setField = (field: keyof FormValues, value: string) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'departmentId' ? { jobTitleId: '' } : {}),
    }));
    setClientErrors(({ [field]: _cleared, ...rest }) => rest);
  };

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const missing: FieldErrors = {};
    requiredFields(isEdit).forEach((field) => {
      if (values[field].trim() === '') missing[field] = REQUIRED_MESSAGE;
    });
    const salary = parseAmount(values.salary);
    if (!isEdit && values.salary.trim() !== '' && salary === null) {
      missing.salary = 'Enter an amount greater than zero';
    }
    setClientErrors(missing);
    if (Object.keys(missing).length > 0) return;

    const shared = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      departmentId: Number(values.departmentId),
      jobTitleId: Number(values.jobTitleId),
      employmentType: values.employmentType,
    };
    if (isEdit) {
      update.mutate(shared, { onSuccess: onSaved });
    } else {
      const request: CreateEmployeeRequest = {
        ...shared,
        countryCode: values.countryCode,
        salary: salary as number,
        hireDate: values.hireDate,
      };
      create.mutate(request, { onSuccess: onSaved });
    }
  };

  const fieldProps = (field: keyof FormValues) => ({
    value: values[field],
    onChange: (event: { target: { value: string } }) => setField(field, event.target.value),
    error: Boolean(errors[field]),
    helperText: errors[field],
    disabled: mutation.isPending,
    size: 'small' as const,
    fullWidth: true,
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="employee-form-title">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="employee-form-title">{isEdit ? 'Edit employee' : 'Add employee'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, pt: 1 }}>
            {formMessage && (
              <Alert severity="error" sx={{ gridColumn: '1 / -1' }}>
                {formMessage}
              </Alert>
            )}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField label="Full name" autoComplete="off" {...fieldProps('fullName')} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField label="Email" type="email" autoComplete="off" {...fieldProps('email')} />
            </Box>
            <TextField select label="Department" {...fieldProps('departmentId')}>
              {options?.departments.map((department) => (
                <MenuItem key={department.id} value={String(department.id)}>
                  {department.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Job title"
              {...fieldProps('jobTitleId')}
              disabled={mutation.isPending || values.departmentId === ''}
            >
              {jobTitles.map((title) => (
                <MenuItem key={title.id} value={String(title.id)}>
                  {title.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Employment type" {...fieldProps('employmentType')}>
              {EMPLOYMENT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            {!isEdit && (
              <>
                <TextField select label="Country" {...fieldProps('countryCode')}>
                  {options?.countries.map((candidate) => (
                    <MenuItem key={candidate.code} value={candidate.code}>
                      {candidate.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={country ? `Annual salary (${country.currencyCode})` : 'Annual salary'}
                  inputMode="decimal"
                  autoComplete="off"
                  {...fieldProps('salary')}
                />
                <TextField
                  label="Hire date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayIso() } }}
                  {...fieldProps('hireDate')}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving' : isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
