import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  date1: string; // Start date in YYYY-MM-DD format
  date2: string; // End date in YYYY-MM-DD format
}

/**
 * Format date to YYYY-MM-DD for API compatibility
 */
function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date range (today to today)
 */
export function getToday(): DateRange {
  const today = new Date();
  const formatted = formatDateForApi(today);

  return {
    date1: formatted,
    date2: formatted,
  };
}

/**
 * Get this week's date range (Monday to Sunday of current week)
 */
export function getThisWeek(): DateRange {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

  return {
    date1: formatDateForApi(weekStart),
    date2: formatDateForApi(weekEnd),
  };
}

/**
 * Get this month's date range (1st to last day of current month)
 */
export function getThisMonth(): DateRange {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  return {
    date1: formatDateForApi(monthStart),
    date2: formatDateForApi(monthEnd),
  };
}

/**
 * Get assembly date range (assembly start date to today)
 * @param assemblyStartDate - Start date from A_ns_C_date_F in YYYY-MM-DD format
 */
export function getAssemblyRange(assemblyStartDate: string): DateRange {
  const today = new Date();

  return {
    date1: assemblyStartDate,
    date2: formatDateForApi(today),
  };
}

/**
 * Create custom date range from two dates
 */
export function getCustomRange(startDate: Date, endDate: Date): DateRange {
  return {
    date1: formatDateForApi(startDate),
    date2: formatDateForApi(endDate),
  };
}
