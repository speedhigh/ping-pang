import type { PlayerId } from '../types/game'
import { otherPlayer } from '../types/game'

export function getCurrentServer(
  scoreA: number,
  scoreB: number,
  firstServer: PlayerId,
): PlayerId {
  const total = scoreA + scoreB
  const isDeuce = scoreA >= 10 && scoreB >= 10

  if (!isDeuce) {
    return Math.floor(total / 2) % 2 === 0 ? firstServer : otherPlayer(firstServer)
  }

  const serverAt1020 =
    Math.floor(20 / 2) % 2 === 0 ? firstServer : otherPlayer(firstServer)

  return total % 2 === 0 ? serverAt1020 : otherPlayer(serverAt1020)
}
