/**
 * Category colour assignment. Colour is never a user choice — it is derived,
 * and no two categories ever share one.
 *
 * The eight curated tokens in colors.css are handed out first, in order. Once
 * they are all taken, further categories get a generated colour placed at the
 * midpoint of the largest unused gap on the hue wheel, which keeps every new
 * colour as far as possible from every colour already in use. Deleting a
 * category frees its colour for the next one.
 *
 * Generated colours are inline `hsl()` rather than tokens, which is the one
 * deliberate exception to the "no inline colour" rule in CLAUDE.md §4.2 — the
 * set is unbounded, so it cannot be enumerated in colors.css ahead of time.
 * Saturation and lightness are pinned to match the curated palette so a
 * generated colour still looks like it belongs to the same family.
 */

/** Hues of the curated tokens, needed because a `var()` string can't be parsed. */
const BASE_PALETTE = [
  { token: 'var(--category-1)', hue: 13 }, // coral
  { token: 'var(--category-2)', hue: 230 }, // indigo
  { token: 'var(--category-3)', hue: 267 }, // violet
  { token: 'var(--category-4)', hue: 158 }, // emerald
  { token: 'var(--category-5)', hue: 37 }, // amber
  { token: 'var(--category-6)', hue: 176 }, // teal
  { token: 'var(--category-7)', hue: 338 }, // pink
  { token: 'var(--category-8)', hue: 226 }, // slate
]

export const CATEGORY_PALETTE = BASE_PALETTE.map((entry) => entry.token)

const GENERATED_SATURATION = 85
const GENERATED_LIGHTNESS = 64

function hueOf(color) {
  const base = BASE_PALETTE.find((entry) => entry.token === color)
  if (base) return base.hue

  const generated = /^hsl\(\s*(\d+(?:\.\d+)?)/.exec(color ?? '')
  return generated ? Number(generated[1]) : null
}

export function generatedCategoryColor(hue) {
  const wrapped = ((Math.round(hue) % 360) + 360) % 360
  return `hsl(${wrapped} ${GENERATED_SATURATION}% ${GENERATED_LIGHTNESS}%)`
}

export function nextCategoryColor(categories = []) {
  const usedColors = new Set(categories.map((category) => category.color))

  // Prefer the designed palette while any of it is still free.
  const freeToken = BASE_PALETTE.find((entry) => !usedColors.has(entry.token))
  if (freeToken) return freeToken.token

  const usedHues = categories
    .map((category) => hueOf(category.color))
    .filter((hue) => hue !== null)
    .sort((a, b) => a - b)

  if (usedHues.length === 0) return BASE_PALETTE[0].token

  // Widest gap on the hue wheel, then sit in the middle of it.
  let widestGap = -1
  let chosenHue = 0

  usedHues.forEach((hue, index) => {
    const next = index === usedHues.length - 1 ? usedHues[0] + 360 : usedHues[index + 1]
    const gap = next - hue
    if (gap > widestGap) {
      widestGap = gap
      chosenHue = hue + gap / 2
    }
  })

  return generatedCategoryColor(chosenHue)
}
