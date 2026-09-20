import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useState } from 'react';
import type { Employee } from '../../api/types';
import { formatMoney, todayIso } from '../../utils/format';
import { type FieldErrors, fieldErrorsOf, formErrorMessage, parseAmount, REQUIRED_MESSAGE } from './formErrors';
import { useChangeSalary } from './useEmployeeMutations';

const MAX_REASON_LENGTH = 200;

interface ChangeSalaryDialogProps {
  open: boolean;
  employee: Employee;
  onClose: () => void;
  onSaved: () => void;
}

export function ChangeSalaryDialog({ open, employee, onClose, onSaved }: ChangeSalaryDialogProps) {
  const [newSalary, setNewSalary] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayIso());
  const [reason, setReason] = useState('');
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const mutation = useChangeSalary(employee.id);

  const errors: FieldErrors = { ...fieldErrorsOf(mutation.error), ...clientErrors };
  const formMessage = formErrorMessage(mutation.error);

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problems: FieldErrors = {};
    const amount = parseAmount(newSalary);
    if (newSalary.trim() === '') problems.newSalary = REQUIRED_MESSAGE;
    else if (amount === null) problems.newSalary = 'Enter an amount greater than zero';
    if (effectiveDate === '') problems.effectiveDate = REQUIRED_MESSAGE;
    if (reason.trim() === '') problems.reason = REQUIRED_MESSAGE;
    setClientErrors(problems);
    if (Object.keys(problems).length > 0) return;

    mutation.mutate(
      { newSalary: amount as number, effectiveDate, reason: reason.trim() },
      { onSuccess: onSaved },
    );
  };

  const clear = (field: string) => setClientErrors(({ [field]: _cleared, ...rest }) => rest);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" aria-labelledby="change-salary-title">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="change-salary-title">Change salary</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <Typography sx={{ color: 'text.secondary' }}>
              {employee.fullName} currently earns {formatMoney(employee.salary, employee.currency)} a year.
            </Typography>
            {formMessage && <Alert severity="error">{formMessage}</Alert>}
            <TextField
              size="small"
              label={`New annual salary (${employee.currency})`}
              inputMode="decimal"
              autoComplete="off"
              value={newSalary}
              onChange={(event) => {
                setNewSalary(event.target.value);
                clear('newSalary');
              }}
              error={Boolean(errors.newSalary)}
              helperText={errors.newSalary}
              disabled={mutation.isPending}
            />
            <TextField
              size="small"
              label="Effective date"
              type="date"
              value={effectiveDate}
              onChange={(event) => {
                setEffectiveDate(event.target.value);
                clear('effectiveDate');
              }}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: todayIso(), min: employee.hireDate } }}
              error={Boolean(errors.effectiveDate)}
              helperText={errors.effectiveDate}
              disabled={mutation.isPending}
            />
            <TextField
              size="small"
              label="Reason"
              placeholder="For example: annual review"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                clear('reason');
              }}
              slotProps={{ htmlInput: { maxLength: MAX_REASON_LENGTH } }}
              error={Boolean(errors.reason)}
              helperText={errors.reason}
              disabled={mutation.isPending}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving' : 'Save salary'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
