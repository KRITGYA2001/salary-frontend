import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney, formatUsd } from './format';

describe('format', () => {
  it('formats money in the given currency without decimals', () => {
    expect(formatMoney(1234567.4, 'USD')).toBe('$1,234,567');
    expect(formatUsd(68300)).toBe('$68,300');
  });

  it('falls back to the currency code when it is not a valid ISO code', () => {
    expect(formatMoney(1500, 'not-a-code')).toBe('not-a-code 1,500');
  });

  it('formats ISO dates and tolerates invalid input', () => {
    expect(formatDate('2021-03-05')).toBe('5 Mar 2021');
    expect(formatDate('nonsense')).toBe('-');
  });
});
