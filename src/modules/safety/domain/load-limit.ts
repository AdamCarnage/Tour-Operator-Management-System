export const MAX_PORTER_LOAD_KG = 25;

export function loadWithinLimit(weightKg: number): boolean {
  return weightKg >= 0 && weightKg <= MAX_PORTER_LOAD_KG;
}
