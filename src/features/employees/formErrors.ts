import { ApiError } from '../../api/client';

export type FieldErrors = Record<string, string>;

/** Field-level messages from a failed request; empty when the failure is not field specific. */
export function fieldErrorsOf(error: unknown): FieldErrors {
  return error instanceof ApiError && error.details ? error.details : {};
}

/** Message for failures that cannot be pinned to one input, such as conflicts or network errors. */
export function formErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    return error.details ? null : error.message;
  }
  return 'The request could not be completed. Check your connection and try again.';
}

export const REQUIRED_MESSAGE = 'This field is required';

/** Parses a user-typed amount; returns null for empty or non-positive input. */
export function parseAmount(text: string): number | null {
  const value = Number(text.replace(/,/g, '').trim());
  return text.trim() !== '' && Number.isFinite(value) && value > 0 ? value : null;
}
