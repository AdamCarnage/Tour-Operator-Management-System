import { CostBasis } from '../../../common/enums';

export type CostLineInput = {
  description: string;
  category: string;
  basis: CostBasis;
  quantity: number;
  unitCostMinor: number;
  unitSellMinor: number;
  currency: string;
};

export type ExpandedCostLine = CostLineInput & {
  quantity: number;
  costMinor: number;
  sellMinor: number;
};

export function multiplierFor(basis: CostBasis, pax: number, vehicles: number) {
  if (basis === CostBasis.PerPerson) {
    return pax;
  }
  if (basis === CostBasis.PerVehicle) {
    return vehicles;
  }
  return 1;
}

export function expandServiceLines(
  lines: CostLineInput[],
  pax: number,
  vehicles: number,
): ExpandedCostLine[] {
  return lines.map((line) => {
    const quantity = line.quantity * multiplierFor(line.basis, pax, vehicles);
    return {
      ...line,
      quantity,
      costMinor: quantity * line.unitCostMinor,
      sellMinor: quantity * line.unitSellMinor,
    };
  });
}

export function summarizeMoney(
  lines: Array<{ costMinor: number; sellMinor: number }>,
) {
  const totalCostMinor = lines.reduce((sum, line) => sum + line.costMinor, 0);
  const totalSellMinor = lines.reduce((sum, line) => sum + line.sellMinor, 0);
  return {
    totalCostMinor,
    totalSellMinor,
    marginMinor: totalSellMinor - totalCostMinor,
  };
}
