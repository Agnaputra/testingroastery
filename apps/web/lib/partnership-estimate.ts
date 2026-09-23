export type PartnershipEstimateInput = {
  beanPrice: number;
  dose: number;
  otherCost: number;
  sellingPrice: number;
  dailyCups: number;
  days: number;
};

export function calculatePartnershipEstimate(input: PartnershipEstimateInput) {
  const { beanPrice, dose, otherCost, sellingPrice, dailyCups, days } = input;
  if (beanPrice <= 0 || dose <= 0) return null;

  const coffeePerCup = (beanPrice / 1000) * dose;
  const directCostPerCup = coffeePerCup + Math.max(0, otherCost);
  const contributionPerCup = sellingPrice > 0 ? sellingPrice - directCostPerCup : null;
  const monthlyCups = Math.max(0, dailyCups) * Math.max(0, days);

  return {
    cupsPerKg: 1000 / dose,
    coffeePerCup,
    directCostPerCup,
    contributionPerCup,
    monthlyCups,
    beanKg: (monthlyCups * dose) / 1000,
    monthlyContribution: contributionPerCup === null ? null : monthlyCups * contributionPerCup,
  };
}
