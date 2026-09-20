const FALLBACK_TEXT = '-';

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Formats an amount in the given ISO currency, falling back to plain digits for unknown codes. */
export function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencyCode} ${Math.round(amount).toLocaleString('en-US')}`;
  }
}

export const formatUsd = (amount: number): string => usdFormatter.format(amount);

/** Formats an ISO date (yyyy-mm-dd) as "5 Mar 2021". */
export function formatDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? FALLBACK_TEXT : dateFormatter.format(parsed);
}

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

/** Relative change between two salaries, or null when there is no previous salary to compare. */
export function formatChangePercent(previous: number | null, current: number): string | null {
  return previous === null || previous === 0 ? null : percentFormatter.format((current - previous) / previous);
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full time',
  PART_TIME: 'Part time',
  CONTRACT: 'Contract',
};

export const formatEmploymentType = (type: string): string => EMPLOYMENT_TYPE_LABELS[type] ?? type;
