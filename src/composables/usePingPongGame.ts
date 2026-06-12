import { computed, ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
  DEFAULT_LAYOUT_DIRECTIONS,
  DEFAULT_PARTICIPANTS,
  DEFAULT_THEME_ID,
  otherPlayer,
  type CompletedGame,
  type MatchFormat,
  type PersistedGameState,
  type PlayerId,
  type WinEvent,
} from '../types/game'
import { playScoreTapSound } from './useVictorySound'
import { getCurrentServer } from '../utils/serveRotation'
import { isGameWon, isMatchWon } from '../utils/scoring'
import { cloneCompletedGames, cloneParticipants } from '../utils/clone'
import {
  layoutDirectionsFromLegacyViewMode,
  normalizeLayoutDirections,
  type LayoutDirection,
  type LayoutDirectionTarget,
} from '../utils/layoutDirection'

const STORAGE_KEY = 'ping-pang-state'

function defaultState(): PersistedGameState {
  return {
    scoreA: 0,
    scoreB: 0,
    gameWinsA: 0,
    gameWinsB: 0,
    currentGameIndex: 1,
    matchFormat: 'none',
    participants: cloneParticipants(DEFAULT_PARTICIPANTS),
    firstServer: 'A',
    themeId: DEFAULT_THEME_ID,
    layoutDirections: { ...DEFAULT_LAYOUT_DIRECTIONS },
    completedGames: [],
  }
}

type HistoryEntry = Pick<
  PersistedGameState,
  'scoreA' | 'scoreB' | 'gameWinsA' | 'gameWinsB' | 'currentGameIndex' | 'firstServer' | 'completedGames'
>

export function usePingPongGame() {
  const state = useLocalStorage<PersistedGameState>(STORAGE_KEY, defaultState(), {
    mergeDefaults: true,
  })

  const history = ref<HistoryEntry[]>([])
  const winEvent = ref<WinEvent | null>(null)
  const isLocked = computed(() => winEvent.value !== null)

  const scoreA = computed(() => state.value.scoreA ?? 0)
  const scoreB = computed(() => state.value.scoreB ?? 0)
  const gameWinsA = computed(() => state.value.gameWinsA ?? 0)
  const gameWinsB = computed(() => state.value.gameWinsB ?? 0)
  const currentGameIndex = computed(() => state.value.currentGameIndex ?? 1)
  const matchFormat = computed(() => state.value.matchFormat ?? 'none')
  const firstServer = computed(() => state.value.firstServer ?? 'A')
  const themeId = computed(() => state.value.themeId ?? DEFAULT_THEME_ID)
  const layoutDirections = computed(() =>
    normalizeLayoutDirections(state.value.layoutDirections),
  )
  const participants = computed(() => state.value.participants ?? DEFAULT_PARTICIPANTS)
  const completedGames = computed(() => state.value.completedGames ?? [])

  const currentServer = computed(() =>
    getCurrentServer(state.value.scoreA, state.value.scoreB, state.value.firstServer),
  )

  const gameWinner = computed(() => isGameWon(state.value.scoreA, state.value.scoreB))

  const matchWinner = computed(() =>
    isMatchWon(state.value.gameWinsA, state.value.gameWinsB, state.value.matchFormat),
  )

  const isMatchOver = computed(() => matchWinner.value !== null)

  function patchState(patch: Partial<PersistedGameState>) {
    state.value = { ...state.value, ...patch }
  }

  function participantName(id: PlayerId): string {
    return state.value.participants.find((p) => p.id === id)?.name ?? id
  }

  function ensureCompletedGames() {
    if (!state.value.completedGames) {
      patchState({ completedGames: [] })
    }
  }

  function pushHistory() {
    history.value.push({
      scoreA: state.value.scoreA,
      scoreB: state.value.scoreB,
      gameWinsA: state.value.gameWinsA,
      gameWinsB: state.value.gameWinsB,
      currentGameIndex: state.value.currentGameIndex,
      firstServer: state.value.firstServer,
      completedGames: cloneCompletedGames(state.value.completedGames),
    })
    if (history.value.length > 50) {
      history.value.shift()
    }
  }

  function recordCompletedGame(winner: PlayerId) {
    ensureCompletedGames()
    const entry: CompletedGame = {
      gameIndex: state.value.currentGameIndex,
      scoreA: state.value.scoreA,
      scoreB: state.value.scoreB,
      winnerId: winner,
    }
    patchState({
      completedGames: [...(state.value.completedGames ?? []), entry],
    })
    return entry
  }

  function score(playerId: PlayerId) {
    if (isLocked.value) return

    pushHistory()

    const nextA = state.value.scoreA + (playerId === 'A' ? 1 : 0)
    const nextB = state.value.scoreB + (playerId === 'B' ? 1 : 0)
    patchState({ scoreA: nextA, scoreB: nextB })

    const winner = isGameWon(nextA, nextB)
    if (!winner) {
      navigator.vibrate?.(8)
      playScoreTapSound()
      return
    }

    handleGameEnd(winner)
  }

  function handleGameEnd(winner: PlayerId) {
    const format = state.value.matchFormat

    if (format === 'none') {
      winEvent.value = {
        type: 'match',
        winnerId: winner,
        scoreA: state.value.scoreA,
        scoreB: state.value.scoreB,
        gameWinsA: 0,
        gameWinsB: 0,
        gameIndex: state.value.currentGameIndex,
        completedGames: [],
      }
      navigator.vibrate?.(12)
      return
    }

    recordCompletedGame(winner)

    const nextWinsA = state.value.gameWinsA + (winner === 'A' ? 1 : 0)
    const nextWinsB = state.value.gameWinsB + (winner === 'B' ? 1 : 0)
    patchState({ gameWinsA: nextWinsA, gameWinsB: nextWinsB })

    const seriesWinner = isMatchWon(nextWinsA, nextWinsB, format)

    winEvent.value = {
      type: seriesWinner ? 'match' : 'game',
      winnerId: seriesWinner ?? winner,
      scoreA: state.value.scoreA,
      scoreB: state.value.scoreB,
      gameWinsA: nextWinsA,
      gameWinsB: nextWinsB,
      gameIndex: state.value.currentGameIndex,
      completedGames: cloneCompletedGames(state.value.completedGames),
    }

    navigator.vibrate?.(seriesWinner ? 18 : 10)
  }

  function dismissWin() {
    const event = winEvent.value
    if (!event) return

    winEvent.value = null

    if (event.type === 'game') {
      patchState({
        scoreA: 0,
        scoreB: 0,
        currentGameIndex: state.value.currentGameIndex + 1,
        firstServer: otherPlayer(state.value.firstServer),
      })
      history.value = []
      return
    }

    if (state.value.matchFormat === 'none') {
      patchState({ scoreA: 0, scoreB: 0 })
      history.value = []
    }
  }

  function startNewMatch() {
    winEvent.value = null
    history.value = []
    patchState({
      ...defaultState(),
      participants: state.value.participants,
      matchFormat: state.value.matchFormat,
      themeId: state.value.themeId,
      layoutDirections: normalizeLayoutDirections(state.value.layoutDirections),
      firstServer: otherPlayer(state.value.firstServer),
    })
  }

  function undo() {
    if (isLocked.value) return
    const last = history.value.pop()
    if (!last) return

    patchState({
      scoreA: last.scoreA,
      scoreB: last.scoreB,
      gameWinsA: last.gameWinsA,
      gameWinsB: last.gameWinsB,
      currentGameIndex: last.currentGameIndex,
      firstServer: last.firstServer,
      completedGames: cloneCompletedGames(last.completedGames),
    })
  }

  function resetGame() {
    if (isLocked.value) return
    pushHistory()
    patchState({ scoreA: 0, scoreB: 0 })
  }

  function resetMatch() {
    winEvent.value = null
    history.value = []
    patchState({
      ...defaultState(),
      participants: state.value.participants,
      matchFormat: state.value.matchFormat,
      themeId: state.value.themeId,
      layoutDirections: normalizeLayoutDirections(state.value.layoutDirections),
      firstServer: state.value.firstServer,
    })
  }

  function setMatchFormat(format: MatchFormat) {
    patchState({ matchFormat: format })
    resetMatch()
  }

  function setParticipantName(id: PlayerId, name: string) {
    const next = state.value.participants.map((p) =>
      p.id === id ? { ...p, name: name.trim() || (id === 'A' ? '选手A' : '选手B') } : p,
    )
    patchState({ participants: next })
  }

  function setFirstServer(id: PlayerId) {
    patchState({ firstServer: id })
  }

  function setThemeId(id: string) {
    patchState({ themeId: id })
  }

  function setLayoutDirection(target: LayoutDirectionTarget, direction: LayoutDirection) {
    patchState({
      layoutDirections: {
        ...normalizeLayoutDirections(state.value.layoutDirections),
        [target]: direction,
      },
    })
  }

  function setScores(nextA: number, nextB: number) {
    if (isLocked.value) return
    pushHistory()
    const scoreA = Math.max(0, nextA)
    const scoreB = Math.max(0, nextB)
    patchState({ scoreA, scoreB })

    const winner = isGameWon(scoreA, scoreB)
    if (winner) {
      handleGameEnd(winner)
    }
  }

  function sanitizeOnLoad() {
    if (!state.value.layoutDirections) {
      const legacy = (state.value as PersistedGameState & { viewMode?: string }).viewMode
      patchState({
        layoutDirections: layoutDirectionsFromLegacyViewMode(legacy),
      })
    } else {
      patchState({
        layoutDirections: normalizeLayoutDirections(state.value.layoutDirections),
      })
    }
    ensureCompletedGames()

    if (state.value.matchFormat === 'none') return

    const winner = isMatchWon(
      state.value.gameWinsA,
      state.value.gameWinsB,
      state.value.matchFormat,
    )
    if (!winner) return

    if (state.value.completedGames.length === 0) {
      patchState({
        gameWinsA: 0,
        gameWinsB: 0,
        scoreA: 0,
        scoreB: 0,
        currentGameIndex: 1,
        completedGames: [],
      })
    }
  }

  watch(
    () => state.value.participants,
    (value) => {
      if (!value?.length) {
        patchState({ participants: cloneParticipants(DEFAULT_PARTICIPANTS) })
      }
    },
    { deep: true },
  )

  sanitizeOnLoad()

  return {
    scoreA,
    scoreB,
    gameWinsA,
    gameWinsB,
    currentGameIndex,
    matchFormat,
    firstServer,
    themeId,
    layoutDirections,
    participants,
    completedGames,
    currentServer,
    gameWinner,
    matchWinner,
    isMatchOver,
    isLocked,
    winEvent,
    participantName,
    score,
    undo,
    dismissWin,
    startNewMatch,
    resetGame,
    resetMatch,
    setMatchFormat,
    setParticipantName,
    setFirstServer,
    setThemeId,
    setLayoutDirection,
    setScores,
  }
}
