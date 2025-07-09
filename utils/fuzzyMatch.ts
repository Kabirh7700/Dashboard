import { Doer } from '../types.ts';

/**
 * Finds the best matching Doer for a given name from a list of Doers.
 * 
 * The matching logic is as follows:
 * 1.  It first attempts an exact, case-insensitive match of the full name.
 * 2.  If no exact match is found, it attempts to find a unique partial match.
 *     - A partial match is when the Doer's full name contains the provided name.
 *     - This match is only considered valid if it's the *only* partial match found,
 *       to avoid ambiguity (e.g., if the name is "Sahil" and there is "Sahil Kumar"
 *       and "Sahil Sharma", no match will be returned).
 * 
 * @param name - The name to match (e.g., from the attendance sheet).
 * @param doers - The list of all available Doers with full names and emails.
 * @returns The matched Doer object if a unique match is found, otherwise null.
 */
export const findBestDoerMatch = (name: string, doers: Doer[]): Doer | null => {
    if (!name || !doers || doers.length === 0) {
        return null;
    }

    const normalizedName = name.toLowerCase().trim();

    // 1. Exact match (case-insensitive)
    const exactMatch = doers.find(d => d.name.toLowerCase().trim() === normalizedName);
    if (exactMatch) {
        return exactMatch;
    }

    // 2. Unique partial match (case-insensitive)
    const partialMatches = doers.filter(d => 
        d.name.toLowerCase().trim().includes(normalizedName)
    );

    if (partialMatches.length === 1) {
        return partialMatches[0];
    }
    
    // If there are 0 or more than 1 partial matches, it's either no match or ambiguous.
    // In both cases, we don't return a match to ensure data integrity.
    return null;
};
