import { loadWithinLimit, MAX_PORTER_LOAD_KG } from './load-limit';

describe('load limit', () => {
  it('allows the published porter limit and rejects anything heavier', () => {
    expect(loadWithinLimit(MAX_PORTER_LOAD_KG)).toBe(true);
    expect(loadWithinLimit(MAX_PORTER_LOAD_KG + 1)).toBe(false);
  });
});
