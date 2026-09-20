import { describe, expect, it } from 'vitest';
import { ApiError } from '../../api/client';
import { todayIso } from '../../utils/format';
import { fieldErrorsOf, formErrorMessage, parseAmount } from './formErrors';

describe('formErrors', () => {
  const validation = new ApiError(400, 'VALIDATION_FAILED', 'Invalid', { email: 'must be valid' });
  const conflict = new ApiError(409, 'CONFLICT', 'Email already exists');

  it('extracts field errors only from errors that carry details', () => {
    expect(fieldErrorsOf(validation)).toEqual({ email: 'must be valid' });
    expect(fieldErrorsOf(conflict)).toEqual({});
    expect(fieldErrorsOf(null)).toEqual({});
  });

  it('shows a form message only when no field can carry the error', () => {
    expect(formErrorMessage(validation)).toBeNull();
    expect(formErrorMessage(conflict)).toBe('Email already exists');
    expect(formErrorMessage(new TypeError('offline'))).toMatch(/could not be completed/);
    expect(formErrorMessage(null)).toBeNull();
  });

  it('parses typed amounts and rejects empty, zero and negative input', () => {
    expect(parseAmount('3,300,000')).toBe(3300000);
    expect(parseAmount(' 12.5 ')).toBe(12.5);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });

  it('formats today as an ISO date', () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
