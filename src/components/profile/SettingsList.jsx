import { Sparkles, Tag, ChevronRight } from 'lucide-react'
import GroupedList from '../shared/GroupedList'
import ListRow from '../shared/ListRow'
import Ring from '../shared/Ring'
import ThemeToggle from './ThemeToggle'
import { formatCurrency } from '../../utils/format'
import './SettingsList.css'

export default function SettingsList({
  categoryCount,
  monthlyBudget,
  budgetPercent,
  isDark,
  onToggleTheme,
  onOpenCategories,
  onOpenBudget,
  onOpenCoach,
}) {
  return (
    <GroupedList className="settings-list">
      <ListRow
        leading={<Tag size={20} strokeWidth={2} aria-hidden="true" />}
        title="Categories"
        subtitle={`${categoryCount} categories`}
        trailing={<ChevronRight size={18} strokeWidth={2} aria-hidden="true" />}
        onClick={onOpenCategories}
      />
      <ListRow
        leading={<Ring percent={budgetPercent} size={52} strokeWidth={10} />}
        bareLeading
        title="Monthly Budget"
        subtitle={formatCurrency(monthlyBudget)}
        trailing={<ChevronRight size={18} strokeWidth={2} aria-hidden="true" />}
        onClick={onOpenBudget}
      />
      <ListRow
        leading={<Sparkles size={20} strokeWidth={2} aria-hidden="true" />}
        title="Pace Coach"
        subtitle="Weekly spending guidance"
        trailing={<ChevronRight size={18} strokeWidth={2} aria-hidden="true" />}
        onClick={onOpenCoach}
      />
      <ListRow
        title="Dark Mode"
        trailing={<ThemeToggle checked={isDark} onChange={onToggleTheme} />}
      />
    </GroupedList>
  )
}
