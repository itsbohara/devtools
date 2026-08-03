import { describe, it, expect } from 'vitest';
import { verifiedAge, isStale, STALE_AFTER_DAYS } from './verified';

const TODAY = '2026-08-03';

describe('verifiedAge', () => {
  it('reads "today" for the same day', () => {
    expect(verifiedAge('2026-08-03', TODAY)).toBe('today');
  });

  it('reads days for under a month', () => {
    expect(verifiedAge('2026-07-29', TODAY)).toBe('5 days ago');
  });

  it('singularises one day', () => {
    expect(verifiedAge('2026-08-02', TODAY)).toBe('1 day ago');
  });

  it('reads months for under a year', () => {
    expect(verifiedAge('2026-06-03', TODAY)).toBe('2 months ago');
  });

  it('reads years beyond twelve months', () => {
    expect(verifiedAge('2024-08-03', TODAY)).toBe('2 years ago');
  });
});

describe('isStale', () => {
  it('is false for a recent date', () => {
    expect(isStale('2026-07-01', TODAY)).toBe(false);
  });

  it('is true beyond the threshold', () => {
    expect(isStale('2025-01-01', TODAY)).toBe(true);
  });

  it('is false exactly at the threshold', () => {
    const boundary = new Date(`${TODAY}T00:00:00Z`);
    boundary.setUTCDate(boundary.getUTCDate() - STALE_AFTER_DAYS);
    expect(isStale(boundary.toISOString().slice(0, 10), TODAY)).toBe(false);
  });
});
