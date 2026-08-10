import { toLocalISO as toISO } from './dates'

export const RANGE_PRESETS = [
  { id: 'thisMonth', label: 'This Month' },
  { id: 'last3Months', label: 'Last 3 Mo' },
  { id: 'thisYear', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
]

export function getRangeBounds(presetId, now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()

  if (presetId === 'thisMonth') {
    return {
      start: toISO(new Date(year, month, 1)),
      end: toISO(now),
    }
  }
  if (presetId === 'last3Months') {
    return {
      start: toISO(new Date(year, month - 2, 1)),
      end: toISO(now),
    }
  }
  if (presetId === 'thisYear') {
    return {
      start: toISO(new Date(year, 0, 1)),
      end: toISO(now),
    }
  }
  return null
}

export function isWithinRange(dateStr, start, end) {
  if (!start || !end) return false
  return dateStr >= start && dateStr <= end
}
