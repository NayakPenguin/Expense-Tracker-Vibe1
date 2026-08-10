import { toLocalISO } from './dates'

function asLocalDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`)
}

function shiftDays(date, days) {
  const shifted = new Date(date)
  shifted.setDate(shifted.getDate() + days)
  return shifted
}

function sumDebits(rows) {
  return rows.reduce((sum, tx) => {
    const amount = Number(tx.amount)
    return tx.direction === 'debit' && Number.isFinite(amount) && amount > 0
      ? sum + amount
      : sum
  }, 0)
}

function transactionsBetween(rows, start, end) {
  return rows.filter((tx) => tx.date >= start && tx.date <= end)
}

export function getPaceCoachInsights({
  transactions = [],
  categories = [],
  monthlyBudget = 0,
  now = new Date(),
}) {
  const today = toLocalISO(now)
  const year = now.getFullYear()
  const month = now.getMonth()
  const dayOfMonth = now.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysLeft = Math.max(1, daysInMonth - dayOfMonth + 1)
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

  const debits = transactions.filter(
    (tx) => tx.direction === 'debit' && Number(tx.amount) > 0 && tx.date
  )
  const monthTransactions = debits.filter(
    (tx) => tx.date.startsWith(monthPrefix) && tx.date <= today
  )
  const spentThisMonth = sumDebits(monthTransactions)
  const budget = Math.max(0, Number(monthlyBudget) || 0)
  const remainingBudget = Math.max(0, budget - spentThisMonth)
  const safeToSpendToday = budget > 0 ? remainingBudget / daysLeft : 0
  const projectedSpend = dayOfMonth > 0
    ? (spentThisMonth / dayOfMonth) * daysInMonth
    : spentThisMonth
  const budgetPercent = budget > 0 ? (spentThisMonth / budget) * 100 : 0

  const todayDate = asLocalDate(today)
  const currentWeekStart = toLocalISO(shiftDays(todayDate, -6))
  const previousWeekEnd = toLocalISO(shiftDays(todayDate, -7))
  const previousWeekStart = toLocalISO(shiftDays(todayDate, -13))
  const currentWeekTransactions = transactionsBetween(debits, currentWeekStart, today)
  const previousWeekTransactions = transactionsBetween(
    debits,
    previousWeekStart,
    previousWeekEnd
  )
  const spentThisWeek = sumDebits(currentWeekTransactions)
  const spentPreviousWeek = sumDebits(previousWeekTransactions)
  const weekChangePercent = spentPreviousWeek > 0
    ? ((spentThisWeek - spentPreviousWeek) / spentPreviousWeek) * 100
    : spentThisWeek > 0
      ? 100
      : 0

  const byCategory = new Map()
  currentWeekTransactions.forEach((tx) => {
    byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) || 0) + Number(tx.amount))
  })
  const topCategoryEntry = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  const topCategory = topCategoryEntry
    ? {
        id: topCategoryEntry[0],
        name: categoryNames.get(topCategoryEntry[0]) || 'Other',
        amount: topCategoryEntry[1],
      }
    : null

  let status = 'on-track'
  if (budget <= 0) status = 'no-budget'
  else if (spentThisMonth >= budget) status = 'exceeded'
  else if (projectedSpend > budget) status = 'over-pace'
  else if (budgetPercent >= 80) status = 'close'

  const milestone = budgetPercent >= 100
    ? 100
    : budgetPercent >= 80
      ? 80
      : budgetPercent >= 50
        ? 50
        : 0

  const suggestions = {
    'no-budget': {
      title: 'Set a monthly budget',
      body: 'Pace Coach needs a target before it can calculate what is safe to spend.',
      action: 'budget',
    },
    exceeded: {
      title: 'Protect the rest of the month',
      body: topCategory
        ? `${topCategory.name} is your largest category this week. Start there for the quickest impact.`
        : 'Review your recent expenses and adjust the budget if your plan has changed.',
      action: 'details',
    },
    'over-pace': {
      title: 'A small slowdown will help',
      body: topCategory
        ? `${topCategory.name} leads this week. Keeping the next few purchases lighter can bring the month back on track.`
        : 'Keep the next few days below your safe-to-spend amount to recover your pace.',
      action: 'details',
    },
    close: {
      title: 'You are close to your limit',
      body: `There are ${daysLeft} days left. Use the daily amount as your guardrail.`,
      action: 'budget',
    },
    'on-track': {
      title: spentThisMonth === 0 ? 'Log your first expense' : 'Keep this pace',
      body: spentThisMonth === 0
        ? 'A few entries are enough for Pace Coach to start finding useful patterns.'
        : `You can spend about ${Math.round(safeToSpendToday).toLocaleString('en-IN')} today and stay within budget.`,
      action: spentThisMonth === 0 ? 'add' : 'details',
    },
  }

  return {
    status,
    milestone,
    budgetPercent,
    spentThisMonth,
    remainingBudget,
    safeToSpendToday,
    projectedSpend,
    daysLeft,
    spentThisWeek,
    spentPreviousWeek,
    weekChangePercent,
    topCategory,
    suggestion: suggestions[status],
  }
}
