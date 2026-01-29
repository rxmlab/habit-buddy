/**
 * Checks if two dates represent the same calendar day (Year, Month, Date),
 * ignoring time components.
 * 
 * @param date1 Date object or timestamp (number)
 * @param date2 Date object or timestamp (number)
 * @returns true if both dates are on the same local calendar day
 */
export function isSameDay(date1: Date | number, date2: Date | number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Returns a date string in YYYY-MM-DD format based on local time.
 * @param date Date object or timestamp
 */
export function toLocalISODate(date: Date | number): string {
  const d = new Date(date);
  return d.getFullYear() + '-' + 
         String(d.getMonth() + 1).padStart(2, '0') + '-' + 
         String(d.getDate()).padStart(2, '0');
}
