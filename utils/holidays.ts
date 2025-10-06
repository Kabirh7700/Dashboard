const HOLIDAY_LIST: string[] = [
    "26/01/2025", // Republic Day
    "26/02/2025", // Maha Shivratri
    "14/03/2025", // Holi
    "31/03/2025", // Id-ul Fitr
    "18/04/2025", // Good Friday
    "15/08/2025", // Independence Day
    "01/10/2025", // Dussehra
    "02/10/2025", // Gandhi Jayanti
    "20/10/2025", // Diwali
    "25/12/2025", // Christmas
];

// Pre-calculate holiday timestamps for efficient lookup
const HOLIDAYS_UTC_TIMESTAMPS: Set<number> = new Set(HOLIDAY_LIST.map(dateStr => {
    const [day, month, year] = dateStr.split('/').map(Number);
    // Use Date.UTC to ensure timezone independence
    return new Date(Date.UTC(year, month - 1, day)).getTime();
}));

/**
 * Checks if a given date is a holiday.
 * @param date - The date to check.
 * @returns True if the date is a holiday, false otherwise.
 */
const isHoliday = (date: Date): boolean => {
    // Create a new date with time set to 0 to compare just the date part in UTC.
    const dateOnly = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return HOLIDAYS_UTC_TIMESTAMPS.has(dateOnly.getTime());
};

/**
 * Checks if a given date is a weekend (Saturday or Sunday).
 * @param date - The date to check.
 * @returns True if the date is a weekend, false otherwise.
 */
const isWeekend = (date: Date): boolean => {
    const day = date.getUTCDay(); // 0 for Sunday, 6 for Saturday
    return day === 0 || day === 6;
};

/**
 * Calculates the number of working days between two dates, inclusive.
 * A working day is any day that is not a weekend or a pre-defined holiday.
 * @param startDate - The start of the date range.
 * @param endDate - The end of the date range.
 * @returns The total number of working days.
 */
export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
    let workingDays = 0;
    const currentDate = new Date(startDate.getTime());

    while (currentDate.getTime() <= endDate.getTime()) {
        if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
            workingDays++;
        }
        // Move to the next day in UTC
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return workingDays;
};
