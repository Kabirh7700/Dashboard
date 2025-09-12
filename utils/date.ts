

// Parses a DD/MM/YYYY string into a UTC Date object
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  // Important: Use Date.UTC to create a timezone-independent date
  return new Date(Date.UTC(year, month - 1, day));
};

// Parses a date string from the sheet (e.g., "MM/DD/YYYY HH:mm:ss" or "Date(YYYY,MM,DD,HH,mm,ss)")
// into a UTC Date object, ignoring the time part for consistency.
export const parseDateTime = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null;
    // Handle Google Sheet's "Date(YYYY,M,D...)" format
    const gvizMatch = /Date\((\d+),(\d+),(\d+)/.exec(dateTimeStr);
    if (gvizMatch) {
        const [_, year, month, day] = gvizMatch.map(Number);
        // Month from gviz is 0-indexed
        return new Date(Date.UTC(year, month, day));
    }
    
    // Fallback for "MM/DD/YYYY ..." format
    const datePartMatch = dateTimeStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (datePartMatch) {
        const [_, month, day, year] = datePartMatch.map(Number);
        // Month from this format is 1-indexed, so subtract 1
        return new Date(Date.UTC(year, month - 1, day));
    }

    return null;
};


// Calculates delay in days. Returns 0 if on time or early.
export const calculateDelayInDays = (plannedStr: string, actualStr: string): number | null => {
    if (!actualStr || !plannedStr) return null;
    const plannedDate = parseDate(plannedStr);
    const actualDate = parseDate(actualStr);
    if (!plannedDate || !actualDate) return null;
    
    if (actualDate.getTime() <= plannedDate.getTime()) return 0;

    const diffTime = actualDate.getTime() - plannedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Gets the start and end date of a given month and year in UTC
export const getMonthDateRange = (year: number, month: number) => {
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));
    return { startDate, endDate };
};

export const getLastWeekDateRange = () => {
    const d = new Date();
    const today = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayOfWeek = today.getUTCDay(); // Sunday: 0, Monday: 1, ...

    // Calculate the date of the Monday of the current week.
    const offsetToCurrentMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setUTCDate(today.getUTCDate() - offsetToCurrentMonday);

    // Last week's Monday is 7 days before current week's Monday.
    const startDate = new Date(currentWeekMonday);
    startDate.setUTCDate(currentWeekMonday.getUTCDate() - 7);

    // Last week's Friday is 4 days after last week's Monday.
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6); // Monday to Friday

    return { startDate, endDate };
};

export const getLastToLastWeekDateRange = () => {
    const { startDate: lastWeekStartDate } = getLastWeekDateRange();
    
    // Last to last week's Monday is 7 days before last week's Monday.
    const startDate = new Date(lastWeekStartDate);
    startDate.setUTCDate(lastWeekStartDate.getUTCDate() - 7);
    
    // Last to last week's Friday is 4 days after its Monday.
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 4);

    return { startDate, endDate };
};


export const getYearDateRange = (year: number) => {
    const startDate = new Date(Date.UTC(year, 0, 1)); // January 1st
    const endDate = new Date(Date.UTC(year, 11, 31)); // December 31st
    return { startDate, endDate };
};


// Counts the number of weekdays (Mon-Fri) in a date range (inclusive) using UTC dates
export const countWeekdays = (start: Date, end: Date): number => {
    let count = 0;
    const currentDate = new Date(start.getTime()); // Create a copy
    while (currentDate.getTime() <= end.getTime()) {
        const dayOfWeek = currentDate.getUTCDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 1=Monday, 5=Friday
            count++;
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return count;
};

// Helper to format UTC dates as DD/MM for consistent display
export const formatDateShort = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return '';
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    return `${day}/${month}`;
};
