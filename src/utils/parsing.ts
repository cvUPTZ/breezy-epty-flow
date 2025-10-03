// src/utils/parsing.ts

/**
 * Parses a value into an array of numbers.
 * Supports string format like "{1,2,3}", array of numbers, or null/undefined.
 * @param value - The value to parse.
 * @returns An array of numbers, or an empty array if parsing fails.
 */
export const parsePlayerIds = (value: unknown): number[] => {
  if (typeof value === 'string') {
    // Handles formats like "{1,2,3}" or "1,2,3"
    const sanitized = value.replace(/[{}]/g, '');
    if (sanitized === '') return [];
    return sanitized.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
  }

  if (Array.isArray(value)) {
    // Handles formats like [1, 2, 3]
    return value.map(Number).filter(id => !isNaN(id));
  }

  // Return an empty array for null, undefined, or other types
  return [];
};