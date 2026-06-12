/** 内置选手共用的专属 emoji，自定义角色不可选用 */
export const BUILTIN_HERO_EMOJI = '👤'

export const BUILTIN_HERO_IDS = {
  A: 'builtin-a',
  B: 'builtin-b',
} as const

export interface RosterHero {
  id: string
  name: string
  emoji: string
  /** 内置选手：不可删、不可改名、不可改 emoji */
  builtin?: boolean
}

export const DEFAULT_ROSTER: RosterHero[] = [
  { id: BUILTIN_HERO_IDS.A, name: '选手A', emoji: BUILTIN_HERO_EMOJI, builtin: true },
  { id: BUILTIN_HERO_IDS.B, name: '选手B', emoji: BUILTIN_HERO_EMOJI, builtin: true },
]

export type PlayerSlot = '1P' | '2P'
