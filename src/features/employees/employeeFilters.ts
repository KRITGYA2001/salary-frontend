import type { QueryParams } from '../../api/client';
import type { EmployeeStatus } from '../../api/types';

export const SEARCH_DEBOUNCE_MS = 300;
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type SortField = 'name' | 'country' | 'salary' | 'hireDate';
export type SortDirection = 'asc' | 'desc';

export interface EmployeeFilters {
  search: string;
  country: string;
  department: string;
  jobTitle: string;
  status: EmployeeStatus | '';
  sort: SortField;
  direction: SortDirection;
  page: number;
  size: number;
}

export const DEFAULT_FILTERS: EmployeeFilters = {
  search: '',
  country: '',
  department: '',
  jobTitle: '',
  status: '',
  sort: 'name',
  direction: 'asc',
  page: 0,
  size: DEFAULT_PAGE_SIZE,
};

const SORT_FIELDS: readonly SortField[] = ['name', 'country', 'salary', 'hireDate'];
const MAX_PAGE_SIZE = 100;

function parseNonNegativeInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return value !== null && Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Reads filters from the URL, replacing anything invalid with its default. */
export function parseFilters(params: URLSearchParams): EmployeeFilters {
  const sort = params.get('sort') as SortField | null;
  const status = params.get('status');
  const size = parseNonNegativeInt(params.get('size'), DEFAULT_PAGE_SIZE);
  return {
    search: params.get('search') ?? '',
    country: params.get('country') ?? '',
    department: params.get('department') ?? '',
    jobTitle: params.get('jobTitle') ?? '',
    status: status === 'ACTIVE' || status === 'INACTIVE' ? status : '',
    sort: sort && SORT_FIELDS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
    direction: params.get('direction') === 'desc' ? 'desc' : 'asc',
    page: parseNonNegativeInt(params.get('page'), 0),
    size: size >= 1 && size <= MAX_PAGE_SIZE ? size : DEFAULT_PAGE_SIZE,
  };
}

/** Writes only non-default values so shared links stay short. */
export function toSearchParams(filters: EmployeeFilters): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(DEFAULT_FILTERS) as (keyof EmployeeFilters)[]).forEach((key) => {
    if (filters[key] !== DEFAULT_FILTERS[key]) {
      params.set(key, String(filters[key]));
    }
  });
  return params;
}

/** Filter parameters shared by the list and CSV export endpoints. */
export function toFilterQuery(filters: EmployeeFilters): QueryParams {
  return {
    search: filters.search.trim(),
    country: filters.country,
    department: filters.department,
    jobTitle: filters.jobTitle,
    status: filters.status,
    sort: filters.sort,
    direction: filters.direction,
  };
}

export function toApiParams(filters: EmployeeFilters): QueryParams {
  return { ...toFilterQuery(filters), page: filters.page, size: filters.size };
}
