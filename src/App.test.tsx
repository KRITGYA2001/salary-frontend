import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { createQueryClient } from './api/queryClient';
import type { Employee, FilterOptions, PageResponse, SalaryHistoryEntry } from './api/types';
import { theme } from './theme/theme';

const FILTERS: FilterOptions = {
  countries: [{ code: 'IN', name: 'India', currencyCode: 'INR' }],
  departments: [{ id: 1, name: 'Engineering' }],
  jobTitles: [{ id: 1, title: 'Software Engineer', departmentId: 1 }],
};

const ASHA: Employee = {
  id: 1,
  employeeCode: 'E-0001',
  fullName: 'Asha Rao',
  email: 'asha@acme.com',
  departmentId: 1,
  department: 'Engineering',
  jobTitleId: 1,
  jobTitle: 'Software Engineer',
  countryCode: 'IN',
  countryName: 'India',
  currency: 'INR',
  employmentType: 'FULL_TIME',
  salary: 3000000,
  salaryUsd: 36000,
  hireDate: '2021-03-05',
  status: 'ACTIVE',
};

const pageOf = (items: Employee[]): PageResponse<Employee> => ({
  items,
  page: 0,
  size: 25,
  totalItems: items.length,
  totalPages: items.length ? 1 : 0,
});

let fetchMock: ReturnType<typeof vi.fn>;

const HISTORY: SalaryHistoryEntry[] = [
  {
    id: 2,
    oldSalary: 2500000,
    newSalary: 3000000,
    currency: 'INR',
    effectiveDate: '2024-04-01',
    reason: 'Annual review',
    changedAt: '2024-04-01T09:00:00Z',
  },
  {
    id: 1,
    oldSalary: null,
    newSalary: 2500000,
    currency: 'INR',
    effectiveDate: '2021-03-05',
    reason: 'Initial salary',
    changedAt: '2021-03-05T09:00:00Z',
  },
];

function stubApi(employees: Employee[], history: SalaryHistoryEntry[] = HISTORY) {
  fetchMock = vi.fn(async (url: string) => {
    if (url.includes('/meta/filters')) return Response.json(FILTERS);
    if (url.includes('/salary-history')) return Response.json(history);
    if (/\/employees\/\d+$/.test(url)) {
      return employees.length ? Response.json(employees[0]) : Response.json({ error: { code: 'NOT_FOUND', message: 'x' } }, { status: 404 });
    }
    if (url.includes('/employees')) return Response.json(pageOf(employees));
    return Response.json({ status: 'UP' });
  });
  vi.stubGlobal('fetch', fetchMock);
}

const requestedUrls = () => fetchMock.mock.calls.map(([url]) => String(url));

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

beforeEach(() => stubApi([ASHA]));
afterEach(() => vi.unstubAllGlobals());

describe('App shell', () => {
  it('redirects the root to the employees page and lists primary navigation', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { level: 1, name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '/insights');
    expect(await screen.findByText('Service online')).toBeInTheDocument();
  });

  it('renders a not-found page for unknown routes', async () => {
    renderAt('/nope');

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});

describe('Employees page', () => {
  it('lists employees with local and USD salary', async () => {
    renderAt('/employees');

    expect(await screen.findByText('Asha Rao')).toBeInTheDocument();
    expect(screen.getByText('E-0001 · asha@acme.com')).toBeInTheDocument();
    expect(screen.getByText('$36,000')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies filters from the URL to the API request', async () => {
    renderAt('/employees?country=IN&sort=salary&direction=desc&page=2&size=50');

    await screen.findByText('Asha Rao');

    const listUrl = requestedUrls().find((url) => url.includes('/employees'))!;
    expect(listUrl).toContain('country=IN');
    expect(listUrl).toContain('sort=salary');
    expect(listUrl).toContain('direction=desc');
    expect(listUrl).toContain('page=2');
    expect(listUrl).toContain('size=50');
  });

  it('debounces search and requests the first page with the settled term', async () => {
    const user = userEvent.setup();
    renderAt('/employees?page=3');
    await screen.findByText('Asha Rao');

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'asha');

    await waitFor(() => expect(requestedUrls().some((url) => url.includes('search=asha'))).toBe(true));
    const searchUrls = requestedUrls().filter((url) => url.includes('search='));
    expect(searchUrls).toHaveLength(1);
    expect(searchUrls[0]).toContain('page=0');
  });

  it('shows an empty state when nothing matches', async () => {
    stubApi([]);
    renderAt('/employees?search=zzz');

    expect(await screen.findByText('No employees match')).toBeInTheDocument();
  });

  it('shows a retryable error when the API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('/meta/filters')
          ? Response.json(FILTERS)
          : Response.json({ error: { code: 'BAD_REQUEST', message: 'x' } }, { status: 400 }),
      ),
    );
    renderAt('/employees');

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});

describe('Employees page export', () => {
  it('links the CSV export to the filters currently applied', async () => {
    stubApi([ASHA]);
    renderAt('/employees?country=IN&status=ACTIVE');

    const link = await screen.findByRole('link', { name: 'Export CSV' });

    expect(link).toHaveAttribute('href', expect.stringContaining('/employees/export.csv?'));
    expect(link.getAttribute('href')).toContain('country=IN');
    expect(link.getAttribute('href')).toContain('status=ACTIVE');
    expect(link.getAttribute('href')).not.toContain('page=');
  });

  it('lets keyboard users skip past the navigation', async () => {
    stubApi([ASHA]);
    renderAt('/employees');

    expect(await screen.findByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content');
  });
});

describe('Employee detail page', () => {
  it('shows the employee and salary history with percentage change', async () => {
    renderAt('/employees/1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Asha Rao' })).toBeInTheDocument();
    expect(await screen.findByText('Started at ₹2,500,000')).toBeInTheDocument();
    expect(screen.getByText(/₹2,500,000 to ₹3,000,000/)).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('Annual review')).toBeInTheDocument();
  });

  it('shows an empty state when there is no salary history', async () => {
    stubApi([ASHA], []);
    renderAt('/employees/1');

    expect(await screen.findByText('No salary changes yet')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown employee', async () => {
    stubApi([]);
    renderAt('/employees/999');

    expect(await screen.findByText('Employee not found')).toBeInTheDocument();
  });

  it('links to the detail page from the employee list', async () => {
    renderAt('/employees');

    expect(await screen.findByRole('link', { name: 'Asha Rao' })).toHaveAttribute('href', '/employees/1');
  });
});

interface RecordedRequest {
  method: string;
  url: string;
  body: unknown;
}

/** Serves the standard fixtures and answers writes with `writeResponse`, recording every write. */
function stubApiWithWrites(writeResponse: () => Response) {
  const writes: RecordedRequest[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      if (method !== 'GET') {
        writes.push({ method, url, body: JSON.parse(String(init?.body)) });
        return writeResponse();
      }
      if (url.includes('/meta/filters')) return Response.json(FILTERS);
      if (url.includes('/salary-history')) return Response.json(HISTORY);
      if (/\/employees\/\d+$/.test(url)) return Response.json(ASHA);
      if (url.includes('/employees')) return Response.json(pageOf([ASHA]));
      return Response.json({ status: 'UP' });
    }),
  );
  return writes;
}

const errorResponse = (status: number, code: string, message: string, details?: Record<string, string>) =>
  Response.json({ error: { code, message, details } }, { status });

describe('Change salary dialog', () => {
  async function openDialog() {
    const user = userEvent.setup();
    renderAt('/employees/1');
    await user.click(await screen.findByRole('button', { name: 'Change salary' }));
    return user;
  }

  it('validates required fields before calling the API', async () => {
    const writes = stubApiWithWrites(() => Response.json(ASHA));
    const user = await openDialog();

    await user.click(screen.getByRole('button', { name: 'Save salary' }));

    expect(await screen.findAllByText('This field is required')).toHaveLength(2);
    expect(writes).toHaveLength(0);
  });

  it('posts the change, confirms it and refreshes the employee', async () => {
    const writes = stubApiWithWrites(() => Response.json(ASHA));
    const user = await openDialog();

    await user.type(screen.getByLabelText(/New annual salary/), '3,300,000');
    await user.type(screen.getByLabelText('Reason'), 'Promotion');
    await user.click(screen.getByRole('button', { name: 'Save salary' }));

    expect(await screen.findByText('Salary updated')).toBeInTheDocument();
    expect(writes).toHaveLength(1);
    expect(writes[0].url).toBe('/api/v1/employees/1/salary');
    expect(writes[0].body).toMatchObject({ newSalary: 3300000, reason: 'Promotion' });
    const detailFetches = vi.mocked(fetch).mock.calls.filter(([url]) => /\/employees\/1$/.test(String(url)));
    expect(detailFetches.length).toBeGreaterThan(1);
  });

  it('shows field errors returned by the API next to the input', async () => {
    stubApiWithWrites(() =>
      errorResponse(400, 'VALIDATION_FAILED', 'Request validation failed', { reason: 'size must be at most 200' }),
    );
    const user = await openDialog();

    await user.type(screen.getByLabelText(/New annual salary/), '3300000');
    await user.type(screen.getByLabelText('Reason'), 'x');
    await user.click(screen.getByRole('button', { name: 'Save salary' }));

    expect(await screen.findByText('size must be at most 200')).toBeInTheDocument();
  });

  it('shows conflicts as a message inside the dialog', async () => {
    stubApiWithWrites(() =>
      errorResponse(409, 'CONFLICT', 'Salary was changed by someone else, please reload and retry'),
    );
    const user = await openDialog();

    await user.type(screen.getByLabelText(/New annual salary/), '3300000');
    await user.type(screen.getByLabelText('Reason'), 'Promotion');
    await user.click(screen.getByRole('button', { name: 'Save salary' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('changed by someone else');
  });
});

const SLOW_FLOW_TIMEOUT_MS = 20000;

async function fillHireForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText('Full name'), 'Asha Rao');
    await user.type(screen.getByLabelText('Email'), 'asha@acme.com');
    await user.click(screen.getByRole('combobox', { name: 'Department' }));
    await user.click(await screen.findByRole('option', { name: 'Engineering' }));
    await user.click(screen.getByRole('combobox', { name: 'Job title' }));
    await user.click(await screen.findByRole('option', { name: 'Software Engineer' }));
    await user.click(screen.getByRole('combobox', { name: 'Country' }));
    await user.click(await screen.findByRole('option', { name: 'India' }));
    await user.type(screen.getByLabelText('Annual salary (INR)'), '3000000');
    await user.click(screen.getByRole('button', { name: 'Add employee', hidden: false }));
}

describe('Add employee dialog', () => {
  it('submits the hire request and opens the new employee', async () => {
    const writes = stubApiWithWrites(() => Response.json(ASHA, { status: 201 }));
    const user = userEvent.setup();
    renderAt('/employees');
    await user.click(await screen.findByRole('button', { name: 'Add employee' }));

    await fillHireForm(user);

    expect(await screen.findByRole('heading', { level: 1, name: 'Asha Rao' })).toBeInTheDocument();
    expect(writes[0]).toMatchObject({
      method: 'POST',
      url: '/api/v1/employees',
      body: {
        fullName: 'Asha Rao',
        email: 'asha@acme.com',
        departmentId: 1,
        jobTitleId: 1,
        countryCode: 'IN',
        employmentType: 'FULL_TIME',
        salary: 3000000,
      },
    });
  }, SLOW_FLOW_TIMEOUT_MS);

  it('shows a duplicate email conflict without closing the dialog', async () => {
    stubApiWithWrites(() => errorResponse(409, 'CONFLICT', 'An employee with this email already exists'));
    const user = userEvent.setup();
    renderAt('/employees');
    await user.click(await screen.findByRole('button', { name: 'Add employee' }));

    await fillHireForm(user);

    expect(await screen.findByText('An employee with this email already exists')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveValue('Asha Rao');
  }, SLOW_FLOW_TIMEOUT_MS);
});
