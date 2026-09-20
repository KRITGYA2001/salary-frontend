import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '../api/queryClient';
import type { GroupSalaryStats, SalaryStats } from '../api/types';
import { theme } from '../theme/theme';
import { InsightsPage } from './InsightsPage';

const SUMMARY: SalaryStats = {
  headcount: 9502,
  averageUsd: 70396,
  medianUsd: 68251,
  p90Usd: 113132,
  minUsd: 12991,
  maxUsd: 170997,
};

const group = (key: string, label: string, averageUsd: number): GroupSalaryStats => ({
  key,
  label,
  stats: { ...SUMMARY, headcount: 100, averageUsd },
});

const BY_COUNTRY = [group('IN', 'India', 20000), group('US', 'United States', 90000)];
const BY_DEPARTMENT = [group('1', 'Engineering', 80000)];

const TOP_EMPLOYEE = {
  id: 155,
  fullName: 'Lena Tanaka',
  jobTitle: 'Accountant',
  countryName: 'United States',
  salaryUsd: 170997,
};

function stubApi() {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.includes('/meta/filters')) {
      return Response.json({
        countries: [{ code: 'IN', name: 'India', currencyCode: 'INR' }],
        departments: [{ id: 1, name: 'Engineering' }],
        jobTitles: [],
      });
    }
    if (url.includes('/insights/summary')) return Response.json(SUMMARY);
    if (url.includes('/insights/by/department')) return Response.json(BY_DEPARTMENT);
    if (url.includes('/insights/by/')) return Response.json(BY_COUNTRY);
    if (url.includes('/insights/distribution')) {
      return Response.json([
        { fromUsd: 10000, toUsd: 50000, count: 30 },
        { fromUsd: 50000, toUsd: 90000, count: 70 },
      ]);
    }
    if (url.includes('/insights/top')) return Response.json([TOP_EMPLOYEE]);
    return Response.json({});
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MemoryRouter>
          <InsightsPage />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('InsightsPage', () => {
  it('shows headline figures, the country breakdown and the distribution', async () => {
    stubApi();
    renderPage();

    expect(await screen.findByText('9,502')).toBeInTheDocument();
    expect(screen.getByText('$70,396')).toBeInTheDocument();
    const table = await screen.findByRole('table', { name: 'Salary by country' });
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getByText('United States')).toBeInTheDocument();
    expect(within(rows[2]).getByText('India')).toBeInTheDocument();
    expect(await screen.findAllByRole('listitem', { name: /employees$/ })).toHaveLength(2);
    expect((await screen.findAllByText('Lena Tanaka')).length).toBe(2);
  });

  it('regroups the breakdown when another dimension is chosen', async () => {
    const fetchMock = stubApi();
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('table', { name: 'Salary by country' });

    await user.click(screen.getByRole('tab', { name: 'Department' }));

    const table = await screen.findByRole('table', { name: 'Salary by department' });
    expect(await within(table).findByText('Engineering')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/insights/by/department'))).toBe(true);
  });

  it('sends the selected country to every insight request', async () => {
    const fetchMock = stubApi();
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('9,502');

    await user.click(screen.getByRole('combobox', { name: 'Country' }));
    await user.click(await screen.findByRole('option', { name: 'India' }));

    await screen.findByRole('button', { name: 'Clear' });
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    ['summary', 'by/country', 'distribution', 'top'].forEach((path) => {
      expect(urls.some((url) => url.includes(`/insights/${path}`) && url.includes('country=IN'))).toBe(true);
    });
  });

  it('offers a retry when an insight fails to load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ error: { code: 'INVALID_PARAMETER', message: 'bad' } }, { status: 400 })),
    );
    renderPage();

    expect(await screen.findByText(/could not be loaded/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
