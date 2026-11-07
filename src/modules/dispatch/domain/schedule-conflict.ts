export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function isValidRange(startsOn: string, endsOn: string): boolean {
  return startsOn <= endsOn;
}
