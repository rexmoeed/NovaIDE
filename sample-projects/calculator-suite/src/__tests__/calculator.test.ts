import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide, power } from '../calculator';

describe('Calculator Suite', () => {
  it('correctly adds two numbers', () => {
    expect(add(10, 5)).toBe(15);
  });

  it('correctly subtracts two numbers', () => {
    expect(subtract(20, 8)).toBe(12);
  });

  it('correctly multiplies two numbers', () => {
    expect(multiply(6, 7)).toBe(42);
  });

  it('correctly divides two numbers', () => {
    // This will fail because divide currently computes a * b (50) instead of a / b (2)
    expect(divide(10, 5)).toBe(2);
  });

  it('throws error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero is undefined');
  });

  it('correctly computes powers', () => {
    expect(power(2, 3)).toBe(8);
  });
});
