import type { CompletedGame, Participant } from '../types/game'

/** 避免 structuredClone 无法克隆 Vue 响应式代理 */
export function cloneParticipants(list: Participant[]): Participant[] {
  return list.map((p) => ({ id: p.id, name: p.name }))
}

export function cloneCompletedGames(games: CompletedGame[] | undefined): CompletedGame[] {
  return (games ?? []).map((g) => ({
    gameIndex: g.gameIndex,
    scoreA: g.scoreA,
    scoreB: g.scoreB,
    winnerId: g.winnerId,
  }))
}
