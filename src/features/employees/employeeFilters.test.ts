import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, parseFilters, toApiParams, toExportUrl, toSearchParams } from './employeeFilters';

describe('parseFilters', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it('reads every supported parameter', () => {
    const params = new URLSearchParams(
      'search=asha&country=IN&department=2&jobTitle=7&status=ACTIVE&sort=salary&direction=desc&page=3&size=50',
    );

    expect(parseFilters(params)).toEqual({
      search: 'asha',
      country: 'IN',
      department: '2',
      jobTitle: '7',
      status: 'ACTIVE',
      sort: 'salary',
      direction: 'desc',
      page: 3,
      size: 50,
    });
  });

  it('replaces invalid values with defaults', () => {
    const params = new URLSearchParams('sort=password&direction=up&status=GONE&page=-4&size=9999');

    expect(parseFilters(params)).toEqual(DEFAULT_FILTERS);
  });
});

describe('toSearchParams', () => {
  it('omits default values so links stay short', () => {
    expect(toSearchParams(DEFAULT_FILTERS).toString()).toBe('');
    expect(toSearchParams({ ...DEFAULT_FILTERS, country: 'IN', page: 2 }).toString()).toBe('country=IN&page=2');
  });

  it('round-trips through parseFilters', () => {
    const filters = { ...DEFAULT_FILTERS, search: 'a b', sort: 'hireDate' as const, direction: 'desc' as const };

    expect(parseFilters(toSearchParams(filters))).toEqual(filters);
  });
});

describe('toApiParams', () => {
  it('maps filters to the list endpoint parameters and trims the search', () => {
    expect(toApiParams({ ...DEFAULT_FILTERS, search: '  asha ', country: 'IN', page: 1 })).toEqual({
      search: 'asha',
      country: 'IN',
      department: '',
      jobTitle: '',
      status: '',
      sort: 'name',
      direction: 'asc',
      page: 1,
      size: 25,
    });
  });
});

describe('toExportUrl', () => {
  it('carries the active filters and sort but not the paging', () => {
    const url = toExportUrl({ ...DEFAULT_FILTERS, country: 'IN', search: ' asha ', sort: 'salary', page: 4, size: 50 });

    expect(url).toBe('/api/v1/employees/export.csv?search=asha&country=IN&sort=salary&direction=asc');
  });

  it('has no filters for the default view apart from the sort', () => {
    expect(toExportUrl(DEFAULT_FILTERS)).toBe('/api/v1/employees/export.csv?sort=name&direction=asc');
  });
});
