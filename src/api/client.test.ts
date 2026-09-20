import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiGet, toQueryString } from './client';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('toQueryString', () => {
  it('drops empty values and encodes the rest', () => {
    expect(toQueryString({ country: 'IN', search: '', department: undefined, page: 0, q: 'a b' })).toBe(
      '?country=IN&page=0&q=a+b',
    );
  });

  it('returns an empty string when nothing is set', () => {
    expect(toQueryString({ a: null })).toBe('');
    expect(toQueryString()).toBe('');
  });
});

describe('apiGet', () => {
  it('requests the versioned path with query params and parses JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/employees', { size: 10 })).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/employees?size=10');
  });

  it('turns the backend error envelope into an ApiError', async () => {
    const envelope = { error: { code: 'VALIDATION_FAILED', message: 'Invalid', details: { email: 'required' } } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(envelope, 400)));

    const failure = await apiGet('/employees').catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 400, code: 'VALIDATION_FAILED', details: { email: 'required' } });
  });

  it('falls back to a generic error when the body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 502, statusText: 'Bad Gateway' })));

    await expect(apiGet('/employees')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN', message: 'Bad Gateway' });
  });
});
