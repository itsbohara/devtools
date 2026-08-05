import { describe, it, expect } from 'vitest';
import { verifiedAge, isStale, verifiedLine, STALE_AFTER_DAYS } from './verified';

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

describe('verifiedLine', () => {
  it('pairs the relative age with a plain label while fresh', () => {
    expect(verifiedLine('2026-08-02', TODAY)).toEqual({ label: 'verified', value: '1 day ago' });
  });

  it('swaps to the absolute date once stale, so the warning names a checkable day', () => {
    expect(verifiedLine('2025-01-01', TODAY)).toEqual({
      label: 'unverified since',
      value: '2025-01-01',
    });
  });

  // The bug this split exists to prevent: a line rendered at build time keeps asserting the build
  // day's answer. Same date, two later readings, two different lines.
  it('re-reads the same date against a moving today', () => {
    expect(verifiedLine(TODAY, TODAY).value).toBe('today');
    expect(verifiedLine(TODAY, '2026-08-05').value).toBe('2 days ago');
    expect(verifiedLine(TODAY, '2027-09-01').label).toBe('unverified since');
  });
});
