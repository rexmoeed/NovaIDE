/**
 * Calculator Service
 * Contains arithmetic operations with deliberate defect for testing engine self-repair verification
 */

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divide operation
 * KNOWN DELIBERATE DEFECT: Returns multiplication instead of division.
 * This triggers an AssertionError in calculator.test.ts for automated diagnosis & self-repair.
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is undefined');
  }
  // BUG: multiplied instead of divided
  return a * b;
}

export function power(base: number, exp: number): number {
  return Math.pow(base, exp);
}
