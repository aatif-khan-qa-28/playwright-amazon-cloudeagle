// Currency / Number

/**
 * Extract the first valid currency amount from a string.
 * Handles concatenated values like "₹1,899.00₹4,499.00" by returning only the first match.
 */
export function parseCurrencyAmount(raw: string): number {
  const match = raw.match(/[\d,]+(?:\.\d+)?/);
  if (!match) return NaN;
  return parseFloat(match[0].replace(/,/g, ''));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// String

export function containsIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function normaliseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// Environment

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable "${name}" is not set. Check your .env file.`);
  }
  return value;
}

export function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

// Wait / Retry

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(fn: () => Promise<T>, maxAttempts = 3, delayMs = 1_000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) await sleep(delayMs);
    }
  }
  throw lastError;
}

// Date

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
