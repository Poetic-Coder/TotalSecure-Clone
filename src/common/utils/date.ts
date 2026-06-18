import { addDays as addD, subMonths, startOfDay } from "date-fns";

export function addDays(date: Date, days: number) {
    return getDateOnly(addD(date, days));
}

export function getDateOnly(date: Date): Date {
    // Fix timezone error when converting to date only
    return new Date(date.toISOString().split('T')[0]);
}

export function getDateOnlyString(date: Date) {
    return date.toISOString().split('T')[0];
}

export function minutesToMilliseconds(minutes: number): number {
    return minutes * 60 * 1000;
}

export function mandateDateToDate(date: string): Date {
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    return new Date(`${year}-${month}-${day}`);
}

export function formatDateToMMDDYY(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-based) + 1
  const dd = String(date.getDate()).padStart(2, '0'); // Day
  const yy = String(date.getFullYear()).slice(-2); // Last two digits of the year

  return `${mm}/${dd}/${yy}`;
}

/**
 * Returns a date range (gte and lte) based on the number of months back from now.
 * @param months Number between 1 and 12 representing the number of months to look back
 */
export function getDateRangeFromMonth(months: number): { gte: Date; lte: Date } {
    if (months < 1 || months > 12) {
      throw new Error('Invalid month value. Must be between 1 and 12.');
    }
  
    const now = new Date();
    const lte = now;
    const gte = startOfDay(subMonths(now, months));
  
    return { gte, lte };
  }