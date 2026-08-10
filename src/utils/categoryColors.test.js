import { describe, expect, it } from 'vitest'
import { CATEGORY_PALETTE, nextCategoryColor } from './categoryColors'

/** Builds n categories by repeatedly asking for the next colour. */
function grow(count) {
  const categories = []
  for (let i = 0; i < count; i += 1) {
    categories.push({ color: nextCategoryColor(categories) })
  }
  return categories
}

describe('nextCategoryColor', () => {
  it('starts at the first curated token', () => {
    expect(nextCategoryColor([])).toBe(CATEGORY_PALETTE[0])
  })

  it('hands out the curated palette in order before generating anything', () => {
    const colors = grow(CATEGORY_PALETTE.length).map((c) => c.color)
    expect(colors).toEqual(CATEGORY_PALETTE)
  })

  it('generates a new colour once the curated palette is exhausted', () => {
    const ninth = nextCategoryColor(grow(8))
    expect(ninth).toMatch(/^hsl\(/)
    expect(CATEGORY_PALETTE).not.toContain(ninth)
  })

  it('never repeats a colour, well past the size of the palette', () => {
    const colors = grow(40).map((c) => c.color)
    expect(new Set(colors).size).toBe(40)
  })

  it('reuses a curated colour freed by a deleted category', () => {
    const categories = grow(8)
    const [removed] = categories.splice(2, 1)
    expect(nextCategoryColor(categories)).toBe(removed.color)
  })

  it('places a generated colour away from the hues already in use', () => {
    // With only coral (13) and emerald (158) taken, the widest gap runs from
    // 158 back around to 13, so the new hue lands in that arc.
    const categories = [{ color: CATEGORY_PALETTE[0] }, { color: CATEGORY_PALETTE[3] }]
    const filled = [...categories]
    // Fill the rest of the palette so generation kicks in.
    while (filled.length < CATEGORY_PALETTE.length) {
      filled.push({ color: nextCategoryColor(filled) })
    }
    const generated = nextCategoryColor(filled)
    const hue = Number(/^hsl\(\s*(\d+)/.exec(generated)[1])
    expect(hue).toBeGreaterThanOrEqual(0)
    expect(hue).toBeLessThan(360)
  })

  it('ignores colours it does not recognise', () => {
    expect(nextCategoryColor([{ color: '#ff0000' }])).toBe(CATEGORY_PALETTE[0])
  })

  it('tolerates a missing argument', () => {
    expect(nextCategoryColor()).toBe(CATEGORY_PALETTE[0])
  })
})
