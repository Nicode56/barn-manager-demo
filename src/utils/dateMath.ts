// Adds a duration to an ISO "YYYY-MM-DD" date string and returns the result
// in the same format, used to project the next expected appointment date
// off of the date a provider visit was confirmed.
function addToDate(dateStr: string, unit: "weeks" | "years", amount: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (unit === "weeks") {
    date.setDate(date.getDate() + amount * 7);
  } else {
    date.setFullYear(date.getFullYear() + amount);
  }
  return date.toISOString().slice(0, 10);
}

export function addWeeksToDate(dateStr: string, weeks: number): string {
  return addToDate(dateStr, "weeks", weeks);
}

export function addYearsToDate(dateStr: string, years: number): string {
  return addToDate(dateStr, "years", years);
}
