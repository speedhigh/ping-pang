import { describe, expect, it } from 'vitest'
import { cloneCompletedGames } from './clone'
import type { CompletedGame } from '../types/game'

describe('cloneCompletedGames', () => {
  it('clones plain game records', () => {
    const games: CompletedGame[] = [{ gameIndex: 1, scoreA: 11, scoreB: 9, winnerId: 'A' }]
    const cloned = cloneCompletedGames(games)
    expect(cloned).toEqual(games)
    expect(cloned).not.toBe(games)
  })
})
