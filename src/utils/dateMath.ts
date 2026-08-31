// Adds a duration to an ISO "YYYY-MM-DD" date string and returns the result
// in the same format, used to project the next expected appointment date
// off of the date a provider visit was confirmed. Stays entirely in UTC -
// a date-only string parses as UTC midnight, and the UTC setters keep it
// there - so the result doesn't shift by a day for viewers east of UTC,
// which local-time parsing/setters would do.
function addToDate(dateStr: string, unit: "weeks" | "years", amount: number): string {
  const date = new Date(dateStr);
  if (unit === "weeks") {
    date.setUTCDate(date.getUTCDate() + amount * 7);
  } else {
    date.setUTCFullYear(date.getUTCFullYear() + amount);
  }
  return date.toISOString().slice(0, 10);
}

export function addWeeksToDate(dateStr: string, weeks: number): string {
  return addToDate(dateStr, "weeks", weeks);
}

export function addYearsToDate(dateStr: string, years: number): string {
  return addToDate(dateStr, "years", years);
}
