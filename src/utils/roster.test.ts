import { describe, expect, it } from 'vitest'
import { applyRosterTap, defaultParticipants } from './roster'
import { BUILTIN_HERO_IDS } from '../types/roster'

describe('roster', () => {
  const [a, b] = defaultParticipants()
  const customId = 'hero-custom'

  it('assigns first tap to 1P then second to 2P', () => {
    expect(applyRosterTap(a.rosterId, null, null)).toEqual({
      slotA: a.rosterId,
      slotB: null,
      changed: true,
    })
    expect(applyRosterTap(b.rosterId, a.rosterId, null)).toEqual({
      slotA: a.rosterId,
      slotB: b.rosterId,
      changed: true,
    })
  })

  it('clears only tapped slot when already assigned', () => {
    expect(applyRosterTap(a.rosterId, a.rosterId, b.rosterId)).toEqual({
      slotA: null,
      slotB: b.rosterId,
      changed: true,
    })
  })

  it('rejects third hero when both slots full', () => {
    expect(applyRosterTap(customId, a.rosterId, b.rosterId)).toEqual({
      slotA: a.rosterId,
      slotB: b.rosterId,
      changed: false,
    })
  })

  it('builtin ids are stable', () => {
    expect(BUILTIN_HERO_IDS.A).toBe('builtin-a')
    expect(BUILTIN_HERO_IDS.B).toBe('builtin-b')
  })
})
