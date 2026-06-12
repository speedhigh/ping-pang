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
  /** 上下半场是否已对调显示 */
  sidesSwapped?: boolean
  /** 每局结束后自动交换上下半场（仅大局赛制） */
  autoSwapSides?: boolean
  /** 上方半场内容额外上移（px），叠加表头补偿 */
  scoreNudgeTop?: number
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
