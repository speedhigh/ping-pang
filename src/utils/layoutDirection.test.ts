import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LAYOUT_DIRECTIONS,
  directionRotateClass,
  getLayoutDirectionPreset,
  layoutDirectionsFromLegacyViewMode,
  layoutDirectionsFromPreset,
  normalizeLayoutDirections,
} from './layoutDirection'

describe('layoutDirection', () => {
  it('normalizes partial input', () => {
    expect(normalizeLayoutDirections({ scoreA: 'left' })).toEqual({
      scoreA: 'left',
      hub: 'up',
      scoreB: 'up',
      gameWinsA: 'up',
      gameWinsB: 'up',
    })
  })

  it('falls back on invalid values', () => {
    expect(normalizeLayoutDirections({ scoreA: 'invalid' as never })).toEqual(DEFAULT_LAYOUT_DIRECTIONS)
  })

  it('migrates legacy landscape view mode', () => {
    expect(layoutDirectionsFromLegacyViewMode('landscape')).toEqual({
      scoreA: 'left',
      hub: 'right',
      scoreB: 'right',
      gameWinsA: 'left',
      gameWinsB: 'right',
    })
  })

  it('maps directions to rotate classes', () => {
    expect(directionRotateClass('up')).toBe('')
    expect(directionRotateClass('left')).toBe('dir-rotate-left')
    expect(directionRotateClass('right')).toBe('dir-rotate-right')
    expect(directionRotateClass('down')).toBe('dir-rotate-down')
  })

  it('builds uniform directions from preset', () => {
    expect(layoutDirectionsFromPreset('left')).toEqual({
      scoreA: 'left',
      hub: 'left',
      scoreB: 'left',
      gameWinsA: 'left',
      gameWinsB: 'left',
    })
  })

  it('detects uniform or custom preset', () => {
    expect(getLayoutDirectionPreset(DEFAULT_LAYOUT_DIRECTIONS)).toBe('up')
    expect(getLayoutDirectionPreset(layoutDirectionsFromPreset('right'))).toBe('right')
    expect(getLayoutDirectionPreset(layoutDirectionsFromLegacyViewMode('landscape'))).toBe('custom')
  })
})
