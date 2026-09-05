export interface CalculatorInput {
  vehiclePrice: number;
  auctionFee: number;
  inlandDelivery: number;
  oceanFreight: number;
  broker: number;
  customs: number;
  certification: number;
  ukraineDelivery: number;
  repair: number;
  companyFee: number;
}

export const calculatorDefaults: CalculatorInput = {
  vehiclePrice: 12_500,
  auctionFee: 1_150,
  inlandDelivery: 650,
  oceanFreight: 1_650,
  broker: 450,
  customs: 4_300,
  certification: 350,
  ukraineDelivery: 700,
  repair: 3_500,
  companyFee: 1_000,
};

export function calculateTurnkey(input: CalculatorInput) {
  return Object.values(input).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}
