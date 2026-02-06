/**
 * Numeric value parser for auto-calculation feature
 * Supports integers, decimals, unit suffixes (k, m, tr), and currency prefixes
 */

export interface ParsedNumber {
    /** The normalized numeric value */
    value: number;
    /** The display unit (k, m, tr, or empty string) */
    unit: string;
    /** Original matched text */
    original: string;
}

/**
 * Unit multipliers for normalization
 */
const UNIT_MULTIPLIERS: Record<string, number> = {
    'k': 1_000,
    'm': 1_000_000,
    'tr': 1_000_000  // Vietnamese: triệu
};

/**
 * Patterns to exclude from numeric detection
 */
const EXCLUSION_PATTERNS = [
    /\d+\.\d+\.\d+/,           // Version numbers (1.2.3)
    /\d{4}-\d{2}-\d{2}/,        // Dates (2024-12-31)
    /\d{1,2}:\d{2}/,            // Times (10:30)
    /https?:\/\//,              // URLs
];

/**
 * Main pattern for detecting numeric values
 * Matches: $500k, 1.5m, 2tr, 100, 2.75, etc.
 */
const NUMERIC_PATTERN = /\$?\s*(\d+(?:\.\d+)?)\s*(k|m|tr)?/gi;

/**
 * Check if text should be excluded from numeric parsing
 */
function shouldExclude(text: string): boolean {
    return EXCLUSION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Parse a single line of text and extract the first numeric value
 * Returns null if no valid number is found
 */
export function parseNumericValue(text: string): ParsedNumber | null {
    // Skip if text matches exclusion patterns
    if (shouldExclude(text)) {
        return null;
    }

    // Reset regex lastIndex for global regex
    NUMERIC_PATTERN.lastIndex = 0;

    const match = NUMERIC_PATTERN.exec(text);
    if (!match) {
        return null;
    }

    const [original, numberStr, unit = ''] = match;
    const baseValue = parseFloat(numberStr);

    if (isNaN(baseValue)) {
        return null;
    }

    // Normalize the unit to lowercase
    const normalizedUnit = unit.toLowerCase();

    // Calculate actual value with multiplier
    const multiplier = UNIT_MULTIPLIERS[normalizedUnit] || 1;
    const value = baseValue * multiplier;

    return {
        value,
        unit: normalizedUnit,
        original: original.trim()
    };
}

/**
 * Format a number with the given display unit
 * @param value - The normalized numeric value
 * @param displayUnit - The unit to use for display (k, m, tr, or empty)
 */
export function formatWithUnit(value: number, displayUnit: string): string {
    if (!displayUnit) {
        // No unit, format as integer or decimal
        return formatNumber(value);
    }

    const multiplier = UNIT_MULTIPLIERS[displayUnit] || 1;
    const displayValue = value / multiplier;

    return `${formatNumber(displayValue)}${displayUnit}`;
}

/**
 * Format a number with thousands separators and appropriate decimals
 */
function formatNumber(num: number): string {
    // If it's a whole number, no decimals
    if (Number.isInteger(num)) {
        return num.toLocaleString('en-US');
    }

    // Otherwise, show up to 2 decimal places, removing trailing zeros
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}
