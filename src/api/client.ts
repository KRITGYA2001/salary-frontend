import type { ApiErrorBody } from './types';

export const API_BASE_PATH = '/api/v1';
export const HEALTH_PATH = '/api/actuator/health';

const FALLBACK_ERROR_CODE = 'UNKNOWN';

/** Failure raised for any non-2xx response; carries the backend error code and per-field details. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/** Builds a query string, dropping empty values so optional filters do not reach the URL. */
export function toQueryString(params: QueryParams = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    return new ApiError(
      response.status,
      body.error?.code ?? FALLBACK_ERROR_CODE,
      body.error?.message ?? response.statusText,
      body.error?.details,
    );
  } catch {
    return new ApiError(response.status, FALLBACK_ERROR_CODE, response.statusText || 'Request failed');
  }
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; params?: QueryParams; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const { method = 'GET', params, body, signal } = options;
  const response = await fetch(`${API_BASE_PATH}${path}${toQueryString(params)}`, {
    method,
    signal,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const apiGet = <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
  apiRequest<T>(path, { params, signal });

/** Reports whether the backend answers its health probe. */
export async function fetchApiHealth(signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(HEALTH_PATH, { signal });
  return response.ok;
}
