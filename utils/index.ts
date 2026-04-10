/**
 * Shared utility helpers for the Playwright test suite.
 *
 * Keep this module free of Playwright imports so it can be used in
 * non-browser contexts (data generation, CI scripts, etc.).
 */

// ─── Currency / Number helpers ───────────────────────────────────────────────

/**
 * Extract the first valid currency amount from a string.
 *
 * Amazon's `.a-offscreen` elements sometimes contain concatenated text from
 * nested child nodes (e.g. "₹1,899.00₹4,499.00"). Using a simple
 * strip-everything approach would produce a corrupted number like "1899.004499".
 *
 * Instead, we extract the FIRST well-formed decimal number in the string,
 * which is always the displayed/deal price.
 *
 * Examples:
 *   parseCurrencyAmount("₹1,899.00")            → 1899
 *   parseCurrencyAmount("₹1,899.00₹4,499.00")  → 1899   ← only first match
 *   parseCurrencyAmount("$1,299.99")            → 1299.99
 *   parseCurrencyAmount("invalid")              → NaN
 */
export function parseCurrencyAmount(raw: string): number {
  // Match the first sequence of digits (with optional comma separators and one decimal part)
  const match = raw.match(/[\d,]+(?:\.\d+)?/);
  if (!match) return NaN;
  return parseFloat(match[0].replace(/,/g, ''));
}

/**
 * Format a number as Indian currency string (for assertion messages).
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// ─── String helpers ───────────────────────────────────────────────────────────

/**
 * Return true if `haystack` contains `needle` (case-insensitive).
 */
export function containsIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Normalise whitespace in a string (collapses multiple spaces / newlines).
 */
export function normaliseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// ─── Environment helpers ──────────────────────────────────────────────────────

/**
 * Read an environment variable and throw a descriptive error if it is missing.
 * Use this for required env vars so failures are obvious at startup.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable "${name}" is not set. Check your .env file.`);
  }
  return value;
}

/**
 * Read an optional environment variable, returning a default if absent.
 */
export function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

// ─── Wait / retry helpers ─────────────────────────────────────────────────────

/**
 * Sleep for `ms` milliseconds.
 * Prefer Playwright's built-in auto-waiting over this; use only as a last resort.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function up to `maxAttempts` times with a `delayMs` pause
 * between each try. Throws the last error if all attempts fail.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1_000,
): Promise<T> {
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

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Return today's date as YYYY-MM-DD (used for timestamped test artefacts).
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
