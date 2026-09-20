import { Button } from '@mui/material';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={MagnifyingGlass}
      title="Page not found"
      description="The address does not match any page here. It may have moved or never existed."
      action={
        <Button component={RouterLink} to="/employees" variant="contained" sx={{ mt: 1 }}>
          Go to employees
        </Button>
      }
    />
  );
}
