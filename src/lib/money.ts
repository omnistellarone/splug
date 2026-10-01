/**
 * Money helpers — AGENTS.md §11, PLAN.md §5
 *
 * All stored values are integer minor units (kobo for NGN).
 * 100000 minor units = ₦1,000.00
 */

const DEFAULT_CURRENCY = "NGN" as const;
const DEFAULT_LOCALE = "en-NG" as const;

/**
 * Format minor units into a locale-aware currency string.
 * Used for display ONLY — never for calculations.
 */
export function formatMoney(
  minorUnits: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  const major = minorUnits / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Convert a decimal major-unit number to integer minor units.
 * Only safe for values coming from controlled server inputs.
 * Never use on untrusted client strings.
 */
export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

/**
 * Convert minor units to a major-unit number for display math.
 * Use formatMoney for display.
 */
export function fromMinorUnits(minorUnits: number): number {
  return minorUnits / 100;
}
