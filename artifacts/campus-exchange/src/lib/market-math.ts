/**
 * Pari-mutuel pool market math — same model used by Polymarket and similar platforms.
 *
 * Prices:
 *   P(YES) = yesPool / totalPool   (implied probability)
 *   P(NO)  = noPool  / totalPool
 *
 * Multipliers (payout per unit staked if that side wins):
 *   M(YES) = totalPool / yesPool
 *   M(NO)  = totalPool / noPool
 *
 * When a user bets X on YES with current yesPool = Y, noPool = N:
 *   poolShare = X / (Y + X)          — fraction of the YES pool they own
 *   payout if YES wins = poolShare * (Y + N + X) = X*(Y+N+X)/(Y+X)
 *
 * Expected value of a YES bet at current prices:
 *   EV = P(YES) * M(YES) - 1        (> 0 means positive EV)
 *
 * The multiplier shown to users is the CURRENT multiplier (before their bet moves the pool).
 * After the bet the multiplier changes slightly — same as Polymarket.
 */

export function getMarketStats(yesPool: number, noPool: number) {
  const totalPool = yesPool + noPool;

  // Implied probabilities
  const yesPercentage = totalPool === 0 ? 50 : (yesPool / totalPool) * 100;
  const noPercentage  = 100 - yesPercentage;

  // Payout multipliers — return on 1 unit if that side wins
  const yesMultiplier = totalPool === 0 || yesPool === 0 ? 2.0 : totalPool / yesPool;
  const noMultiplier  = totalPool === 0 || noPool  === 0 ? 2.0 : totalPool / noPool;

  return { totalPool, yesMultiplier, noMultiplier, yesPercentage, noPercentage };
}

/**
 * Calculate the exact payout for a bet AFTER the pool has been updated.
 * Use this on the market-detail page to show "you will receive X if YES wins".
 */
export function calculatePayout(
  amountPaid: number,
  type: "YES" | "NO",
  yesPool: number,
  noPool: number
): number {
  if (amountPaid <= 0) return 0;
  const currentSidePool = type === "YES" ? yesPool : noPool;
  const newSidePool = currentSidePool + amountPaid;
  const newTotalPool = yesPool + noPool + amountPaid;
  const poolShare = amountPaid / newSidePool;
  return Math.floor(poolShare * newTotalPool);
}

/**
 * Calculate the pool share percentage a bet captures.
 */
export function calculatePoolShare(
  amountPaid: number,
  type: "YES" | "NO",
  yesPool: number,
  noPool: number
): number {
  if (amountPaid <= 0) return 0;
  const currentSidePool = type === "YES" ? yesPool : noPool;
  return amountPaid / (currentSidePool + amountPaid);
}

/** Format a number as Indian Rupees: ₹1,00,000 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
