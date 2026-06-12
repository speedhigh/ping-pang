import type { MatchFormat, PlayerId } from '../types/game'

export const WINNING_SCORE = 11
export const MIN_LEAD = 2

export function isGameWon(scoreA: number, scoreB: number): PlayerId | null {
  const leader = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : null
  if (!leader) return null

  const leaderScore = leader === 'A' ? scoreA : scoreB
  const trailerScore = leader === 'A' ? scoreB : scoreA

  if (leaderScore >= WINNING_SCORE && leaderScore - trailerScore >= MIN_LEAD) {
    return leader
  }

  return null
}

export function gamesRequiredToWin(format: MatchFormat): number {
  switch (format) {
    case 'bestOf3':
      return 2
    case 'bestOf5':
      return 3
    default:
      return 1
  }
}

export function isMatchWon(
  gameWinsA: number,
  gameWinsB: number,
  format: MatchFormat,
): PlayerId | null {
  if (format === 'none') return null

  const required = gamesRequiredToWin(format)
  if (gameWinsA >= required) return 'A'
  if (gameWinsB >= required) return 'B'
  return null
}

export function matchFormatLabel(format: MatchFormat): string {
  switch (format) {
    case 'bestOf3':
      return '三局两胜'
    case 'bestOf5':
      return '五局三胜'
    default:
      return '单场'
  }
}
