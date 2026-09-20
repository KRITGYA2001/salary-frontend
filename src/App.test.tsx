import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { createQueryClient } from './api/queryClient';
import type { FilterOptions } from './api/types';
import { theme } from './theme/theme';

const FILTERS: FilterOptions = {
  countries: [{ code: 'IN', name: 'India', currencyCode: 'INR' }],
  departments: [{ id: 1, name: 'Engineering' }],
  jobTitles: [{ id: 1, title: 'Software Engineer', departmentId: 1 }],
};

function renderAt(path: string) {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      url.includes('/meta/filters') ? Response.json(FILTERS) : Response.json({ status: 'UP' }),
    ),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('App shell', () => {
  it('redirects the root to the employees page and lists primary navigation', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { level: 1, name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '/insights');
  });

  it('shows countries loaded from the API and the service status', async () => {
    renderAt('/employees');

    expect(await screen.findByText('India (INR)')).toBeInTheDocument();
    expect(await screen.findByText('Service online')).toBeInTheDocument();
  });

  it('shows a retryable error when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { code: 'INTERNAL_ERROR', message: 'x' } }, { status: 400 })));
    renderAt('/employees');

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders a not-found page for unknown routes', async () => {
    renderAt('/nope');

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
