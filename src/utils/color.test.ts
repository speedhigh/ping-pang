import { describe, expect, it } from 'vitest'
import { hexToRgba } from './color'

describe('hexToRgba', () => {
  it('converts hex to rgba', () => {
    expect(hexToRgba('#E84855', 0.14)).toBe('rgba(232, 72, 85, 0.14)')
  })
})
