import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  HeartPulse,
  Receipt,
  Clapperboard,
  Scissors,
  MoreHorizontal,
  Tag,
} from 'lucide-react'

const CATEGORY_ICONS = {
  food: UtensilsCrossed,
  transport: Car,
  shopping: ShoppingBag,
  health: HeartPulse,
  bills: Receipt,
  entertainment: Clapperboard,
  personal: Scissors,
  other: MoreHorizontal,
}

export function getCategoryIcon(categoryId) {
  return CATEGORY_ICONS[categoryId] || Tag
}
