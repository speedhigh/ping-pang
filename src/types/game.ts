import type { LayoutDirections } from '../utils/layoutDirection'
import { DEFAULT_LAYOUT_DIRECTIONS } from '../utils/layoutDirection'

export type PlayerId = 'A' | 'B'

export interface Participant {
  id: PlayerId
  name: string
}

export type MatchFormat = 'none' | 'bestOf3' | 'bestOf5'

export type WinType = 'game' | 'match'

export interface CompletedGame {
  gameIndex: number
  scoreA: number
  scoreB: number
  winnerId: PlayerId
}

export interface WinEvent {
  type: WinType
  winnerId: PlayerId
  scoreA: number
  scoreB: number
  gameWinsA: number
  gameWinsB: number
  gameIndex: number
  completedGames: CompletedGame[]
}

export interface PersistedGameState {
  scoreA: number
  scoreB: number
  gameWinsA: number
  gameWinsB: number
  currentGameIndex: number
  matchFormat: MatchFormat
  participants: Participant[]
  firstServer: PlayerId
  themeId: string
  layoutDirections: LayoutDirections
  completedGames: CompletedGame[]
  /** @deprecated 已迁移为 layoutDirections */
  viewMode?: string
}

export const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: 'A', name: '选手A' },
  { id: 'B', name: '选手B' },
]

export const DEFAULT_THEME_ID = 'arena-duo'
export { DEFAULT_LAYOUT_DIRECTIONS }

export function otherPlayer(id: PlayerId): PlayerId {
  return id === 'A' ? 'B' : 'A'
}
