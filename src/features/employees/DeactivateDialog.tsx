import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { Employee } from '../../api/types';
import { formErrorMessage } from './formErrors';
import { useDeactivateEmployee } from './useEmployeeMutations';

interface DeactivateDialogProps {
  open: boolean;
  employee: Employee;
  onClose: () => void;
  onDone: () => void;
}

export function DeactivateDialog({ open, employee, onClose, onDone }: DeactivateDialogProps) {
  const mutation = useDeactivateEmployee(employee.id);
  const message = formErrorMessage(mutation.error);

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" aria-labelledby="deactivate-title">
      <DialogTitle id="deactivate-title">Deactivate {employee.fullName}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          They stay in the records and keep their salary history, but no longer count in active pay insights, and their
          salary can no longer be changed.
        </DialogContentText>
        {message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={handleClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(undefined, { onSuccess: onDone })}
        >
          {mutation.isPending ? 'Deactivating' : 'Deactivate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
