import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchApiHealth } from '../api/client';
import { colors } from '../theme/tokens';

const HEALTH_POLL_MS = 60_000;

type Status = 'checking' | 'up' | 'down';

const LABELS: Record<Status, string> = {
  checking: 'Checking service',
  up: 'Service online',
  down: 'Service unreachable',
};

const DOT_COLORS: Record<Status, string> = {
  checking: colors.lineStrong,
  up: colors.accent,
  down: colors.danger,
};

/** Shows whether the backend answers its health probe; the state is spelled out, not only coloured. */
export function ApiStatus() {
  const { data, isPending } = useQuery({
    queryKey: ['api-health'],
    queryFn: ({ signal }) => fetchApiHealth(signal),
    refetchInterval: HEALTH_POLL_MS,
    retry: false,
  });
  const status: Status = isPending ? 'checking' : data ? 'up' : 'down';

  return (
    <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DOT_COLORS[status] }} />
      <Typography variant="body2" color="text.secondary">
        {LABELS[status]}
      </Typography>
    </Box>
  );
}
