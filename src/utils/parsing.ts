// src/utils/parsing.ts

/**
 * Parses a value into an array of numbers.
 * Supports string format like "{1,2,3}", array of numbers, or null/undefined.
 * @param value - The value to parse.
 * @returns An array of numbers, or an empty array if parsing fails.
 */
export function parsePlayerIds(value: unknown): number[] {
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
}

/**
 * Safely parses a JSON string, with a fallback for non-JSON or malformed strings.
 * @param value - The value to parse, expected to be a string.
 * @returns An array of objects, or an empty array if parsing fails.
 */
export const safeParseJson = (value: unknown): any[] => {
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }
  
  try {
    // Attempt standard JSON parsing first.
    const parsed = JSON.parse(value);
    // Ensure the result is an array, as expected for player lists.
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Standard JSON.parse failed. Attempting fallback for PostgreSQL-style array.", value);
    const trimmed = value.trim();
    
    // Check for PostgreSQL array string format (e.g., '{"{...}","{...}"}')
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      // Handle empty pg array case: '{}'
      if (trimmed.length === 2) {
        return [];
      }
      
      // Convert to a standard JSON array string by replacing outer braces with brackets.
      const jsonArrayString = `[${trimmed.substring(1, trimmed.length - 1)}]`;
      
      try {
        const parsedArray = JSON.parse(jsonArrayString);
        
        // If the result is an array of strings, each string is likely a JSON object.
        if (Array.isArray(parsedArray) && parsedArray.every(item => typeof item === 'string')) {
          return parsedArray.map(jsonString => {
            try {
              // Parse each individual JSON string.
              return JSON.parse(jsonString);
            } catch (innerError) {
              console.error("Failed to parse inner JSON string during fallback:", jsonString, innerError);
              return null; // Mark failed ones as null
            }
          }).filter(item => item !== null); // Filter out any items that failed to parse.
        }
        
        // If it's already an array of objects, return it directly.
        if (Array.isArray(parsedArray)) {
          return parsedArray;
        }
      } catch (fallbackError) {
        console.error("Fallback parsing also failed:", fallbackError);
        return [];
      }
    }
    
    // If no parsing strategy works, return an empty array.
    return [];
  }
};
