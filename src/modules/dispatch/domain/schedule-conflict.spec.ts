import { describe, expect, it } from '@jest/globals';
import { isValidRange, rangesOverlap } from './schedule-conflict';

describe('schedule conflict', () => {
  it('detects inclusive date overlap', () => {
    expect(
      rangesOverlap('2026-11-01', '2026-11-05', '2026-11-05', '2026-11-08'),
    ).toBe(true);
    expect(
      rangesOverlap('2026-11-01', '2026-11-04', '2026-11-05', '2026-11-08'),
    ).toBe(false);
  });

  it('rejects an end date before the start date', () => {
    expect(isValidRange('2026-11-08', '2026-11-01')).toBe(false);
  });
});
