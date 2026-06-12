import { describe, expect, it } from 'vitest'
import { isGameWon, isMatchWon } from './scoring'

describe('isGameWon', () => {
  it('wins at 11:9', () => {
    expect(isGameWon(11, 9)).toBe('A')
  })

  it('continues at 11:10', () => {
    expect(isGameWon(11, 10)).toBe(null)
  })

  it('wins at 12:10', () => {
    expect(isGameWon(12, 10)).toBe('A')
  })
})

describe('isMatchWon', () => {
  it('returns null for single game format', () => {
    expect(isMatchWon(1, 0, 'none')).toBe(null)
  })

  it('wins best of 3 at 2 game wins', () => {
    expect(isMatchWon(2, 1, 'bestOf3')).toBe('A')
  })
})
