export type ParkFeeInput = {
  visitors: number;
  nights: number;
  vehicles: number;
  feePerVisitorNightMinor: number;
  feePerVehicleMinor: number;
  vatBps: number;
};

export function calculateParkFees(input: ParkFeeInput) {
  const visitorMinor =
    input.visitors * input.nights * input.feePerVisitorNightMinor;
  const vehicleMinor = input.vehicles * input.feePerVehicleMinor;
  const netMinor = visitorMinor + vehicleMinor;
  const vatMinor = Math.round((netMinor * input.vatBps) / 10_000);
  return {
    visitorMinor,
    vehicleMinor,
    netMinor,
    vatMinor,
    totalMinor: netMinor + vatMinor,
  };
}
