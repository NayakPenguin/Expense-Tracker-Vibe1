export function formatCurrency(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN')
}

export function formatDateLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function getMonthLabel(date = new Date()) {
  return date.toLocaleDateString('en-IN', { month: 'long' })
}
