import { calculateParkFees } from './park-fees';

describe('park fees', () => {
  it('adds 18 percent VAT to visitor and vehicle fees', () => {
    expect(
      calculateParkFees({
        visitors: 2,
        nights: 3,
        vehicles: 1,
        feePerVisitorNightMinor: 1000,
        feePerVehicleMinor: 5000,
        vatBps: 1800,
      }),
    ).toEqual({
      visitorMinor: 6000,
      vehicleMinor: 5000,
      netMinor: 11000,
      vatMinor: 1980,
      totalMinor: 12980,
    });
  });
});
