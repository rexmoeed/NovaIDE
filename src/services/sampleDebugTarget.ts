/**
 * Real Sample Debug Target Program
 * Used for debugger acceptance tests and interactive debugging sessions.
 * Contains calculable state, loops, conditional branches, and a deliberate boundary bug.
 */

export interface CalculationResult {
  total: number;
  average: number;
  itemsProcessed: number;
  maxItem: number;
}

export function computeInventoryAverages(prices: number[]): CalculationResult {
  let total = 0;
  let maxItem = 0;
  let itemsProcessed = 0;

  // Deliberate test loop: demonstrates stepping and breakpoints
  for (let i = 0; i < prices.length; i++) {
    const currentPrice = prices[i];

    if (currentPrice > maxItem) {
      maxItem = currentPrice;
    }

    total += currentPrice;
    itemsProcessed += 1;
  }

  // Potential edge case: empty array causes division by zero NaN
  if (prices.length === 0) {
    throw new Error('Cannot compute average of empty price inventory');
  }

  const average = total / itemsProcessed;

  return {
    total,
    average,
    itemsProcessed,
    maxItem,
  };
}

export function main() {
  const samplePrices = [45, 120, 89, 320, 15];
  const summary = computeInventoryAverages(samplePrices);
  return summary;
}
