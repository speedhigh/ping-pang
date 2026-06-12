import { describe, expect, it } from 'vitest'
import {
  isAtGamePoint,
  isGameWon,
  isMatchWon,
  summarizeCompletedGames,
} from './scoring'

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

describe('isAtGamePoint', () => {
  it('is true from 10 points onward', () => {
    expect(isAtGamePoint(9)).toBe(false)
    expect(isAtGamePoint(10)).toBe(true)
    expect(isAtGamePoint(12)).toBe(true)
  })
})

describe('summarizeCompletedGames', () => {
  it('totals scores across games', () => {
    expect(
      summarizeCompletedGames([
        { gameIndex: 1, scoreA: 11, scoreB: 9, winnerId: 'A' },
        { gameIndex: 2, scoreA: 9, scoreB: 11, winnerId: 'B' },
        { gameIndex: 3, scoreA: 11, scoreB: 7, winnerId: 'A' },
      ]),
    ).toEqual({
      totalScoreA: 31,
      totalScoreB: 27,
      gameCount: 3,
      netScoreA: 4,
    })
  })
})
