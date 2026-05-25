export function getMarketStats(yesPool: number, noPool: number) {
  const totalPool = yesPool + noPool;
  const yesMultiplier = totalPool === 0 || yesPool === 0 ? 2.00 : totalPool / yesPool;
  const noMultiplier = totalPool === 0 || noPool === 0 ? 2.00 : totalPool / noPool;
  const yesPercentage = totalPool === 0 ? 50 : (yesPool / totalPool) * 100;
  const noPercentage = 100 - yesPercentage;

  return { totalPool, yesMultiplier, noMultiplier, yesPercentage, noPercentage };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("₹", "Rs. ");
}
