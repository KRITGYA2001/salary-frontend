import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

const MAX_RETRIES = 2;
const STALE_TIME_MS = 30_000;

/** Client errors (4xx) will not fix themselves, so only transient failures are retried. */
const shouldRetry = (failureCount: number, error: Error) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < MAX_RETRIES;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_MS, retry: shouldRetry, refetchOnWindowFocus: false },
    },
  });
}
