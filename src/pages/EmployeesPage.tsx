import { Alert, Button, Chip, Skeleton, Stack } from '@mui/material';
import { UsersThree } from '@phosphor-icons/react';
import { useFilterOptions } from '../api/meta';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';

const COUNTRY_PLACEHOLDER_COUNT = 8;

export function EmployeesPage() {
  const { data, isPending, isError, refetch } = useFilterOptions();

  return (
    <>
      <PageHeader
        title="Employees"
        description="Find anyone, compare pay across countries and keep every salary change on record."
      />
      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          The employee service did not respond. Check your connection and try again.
        </Alert>
      ) : (
        <EmptyState
          icon={UsersThree}
          title="The employee table is coming next"
          description="Filters, search and sorting will appear here. Pay is recorded in these countries:"
          action={
            <Stack direction="row" sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }} aria-busy={isPending}>
              {isPending
                ? Array.from({ length: COUNTRY_PLACEHOLDER_COUNT }, (_, index) => (
                    <Skeleton key={index} variant="rounded" width={96} height={32} />
                  ))
                : data?.countries.map((country) => (
                    <Chip key={country.code} label={`${country.name} (${country.currencyCode})`} variant="outlined" />
                  ))}
            </Stack>
          }
        />
      )}
    </>
  );
}
