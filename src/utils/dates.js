/**
 * Date helpers that stay in the user's local calendar.
 *
 * `Date#toISOString()` converts to UTC first, so slicing it for a `YYYY-MM-DD`
 * string shifts the day for any timezone offset from UTC — in IST (+5:30) the
 * first of the month resolved to the last day of the previous month, and
 * "today" resolved to yesterday before 5:30am. These build the string from
 * local calendar fields instead.
 */

export function toLocalISO(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayISO() {
  return toLocalISO()
}
