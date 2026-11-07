import { describe, expect, it } from '@jest/globals';
import { CostBasis } from '../../../common/enums';
import { expandServiceLines, summarizeMoney } from './quote-costing';

describe('quote costing', () => {
  it('multiplies person and vehicle lines and keeps flat lines', () => {
    const expanded = expandServiceLines(
      [
        {
          description: 'Park fee',
          category: 'permit',
          basis: CostBasis.PerPerson,
          quantity: 1,
          unitCostMinor: 1000,
          unitSellMinor: 1500,
          currency: 'USD',
        },
        {
          description: 'Vehicle',
          category: 'transport',
          basis: CostBasis.PerVehicle,
          quantity: 1,
          unitCostMinor: 5000,
          unitSellMinor: 8000,
          currency: 'USD',
        },
        {
          description: 'Guide',
          category: 'crew',
          basis: CostBasis.Flat,
          quantity: 2,
          unitCostMinor: 200,
          unitSellMinor: 400,
          currency: 'USD',
        },
      ],
      4,
      2,
    );
    expect(expanded.map((line) => line.quantity)).toEqual([4, 2, 2]);
    expect(summarizeMoney(expanded)).toEqual({
      totalCostMinor: 14400,
      totalSellMinor: 22800,
      marginMinor: 8400,
    });
  });
});
