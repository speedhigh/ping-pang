import {
  DEFAULT_LAYOUT_DIRECTIONS,
  DEFAULT_THEME_ID,
  otherPlayer,
  type CompletedGame,
  type MatchFormat,
  type PersistedGameState,
  type PlayerId,
  type WinEvent,
} from '../types/game'
import type { RosterHero } from '../types/roster'
import { BUILTIN_HERO_EMOJI } from '../types/roster'
import {
  createCustomHeroId,
  defaultParticipants,
  defaultRoster,
  isHeroInUse,
  migrateParticipantsToRoster,
  normalizeRoster,
  participantsFromRosterIds,
  rosterHeroById,
  rosterIdForPlayer,
} from '../utils/roster'
import { playScoreTapSound } from './useVictorySound'
import { getCurrentServer } from '../utils/serveRotation'
import { isGameWon, isMatchWon } from '../utils/scoring'
import { cloneCompletedGames, cloneParticipants } from '../utils/clone'
import {
  layoutDirectionsFromLegacyViewMode,
  layoutDirectionsFromPreset,
  normalizeLayoutDirections,
  type LayoutDirection,
  type LayoutDirectionPreset,
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
    participants: cloneParticipants(defaultParticipants()),
    roster: defaultRoster(),
    firstServer: 'A',
    themeId: DEFAULT_THEME_ID,
    layoutDirections: { ...DEFAULT_LAYOUT_DIRECTIONS },
    completedGames: [],
    sidesSwapped: false,
    autoSwapSides: false,
    scoreNudgeTop: 16,
  }
}

type HistoryEntry = Pick<
  PersistedGameState,
  | 'scoreA'
  | 'scoreB'
  | 'gameWinsA'
  | 'gameWinsB'
  | 'currentGameIndex'
  | 'firstServer'
  | 'completedGames'
  | 'sidesSwapped'
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
  const participants = computed(() => state.value.participants ?? defaultParticipants())
  const roster = computed(() => normalizeRoster(state.value.roster))
  const completedGames = computed(() => state.value.completedGames ?? [])
  const sidesSwapped = computed(() => state.value.sidesSwapped ?? false)
  const autoSwapSides = computed(() => state.value.autoSwapSides ?? false)
  const scoreNudgeTop = computed(() => state.value.scoreNudgeTop ?? 16)

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

  function participantEmoji(id: PlayerId): string {
    return state.value.participants.find((p) => p.id === id)?.emoji ?? BUILTIN_HERO_EMOJI
  }

  function slotRosterIds(): { slotA: string; slotB: string } {
    return {
      slotA: rosterIdForPlayer(state.value.participants, 'A'),
      slotB: rosterIdForPlayer(state.value.participants, 'B'),
    }
  }

  function syncParticipantsFromRoster() {
    const { slotA, slotB } = slotRosterIds()
    patchState({
      participants: participantsFromRosterIds(normalizeRoster(state.value.roster), slotA, slotB),
    })
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
      sidesSwapped: state.value.sidesSwapped ?? false,
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
      const patch: Partial<PersistedGameState> = {
        scoreA: 0,
        scoreB: 0,
        currentGameIndex: state.value.currentGameIndex + 1,
        firstServer: otherPlayer(state.value.firstServer),
      }
      if (state.value.autoSwapSides && state.value.matchFormat !== 'none') {
        patch.sidesSwapped = !(state.value.sidesSwapped ?? false)
      }
      patchState(patch)
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
      roster: normalizeRoster(state.value.roster),
      matchFormat: state.value.matchFormat,
      themeId: state.value.themeId,
      layoutDirections: normalizeLayoutDirections(state.value.layoutDirections),
      autoSwapSides: state.value.autoSwapSides ?? false,
      scoreNudgeTop: state.value.scoreNudgeTop ?? 16,
      firstServer: otherPlayer(state.value.firstServer),
    })
  }

  function toggleSides() {
    if (isLocked.value) return
    patchState({ sidesSwapped: !(state.value.sidesSwapped ?? false) })
  }

  function setAutoSwapSides(enabled: boolean) {
    patchState({ autoSwapSides: enabled })
  }

  function setScoreNudgeTop(px: number) {
    patchState({ scoreNudgeTop: Math.max(0, Math.min(48, Math.round(px))) })
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
      sidesSwapped: last.sidesSwapped ?? false,
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
      roster: normalizeRoster(state.value.roster),
      matchFormat: state.value.matchFormat,
      themeId: state.value.themeId,
      layoutDirections: normalizeLayoutDirections(state.value.layoutDirections),
      autoSwapSides: state.value.autoSwapSides ?? false,
      scoreNudgeTop: state.value.scoreNudgeTop ?? 16,
      firstServer: state.value.firstServer,
    })
  }

  function setMatchFormat(format: MatchFormat) {
    const patch: Partial<PersistedGameState> = { matchFormat: format }
    if (format === 'none') {
      patch.autoSwapSides = false
    }
    patchState(patch)
    resetMatch()
  }

  function setPlayerSlots(rosterIdA: string, rosterIdB: string) {
    const heroes = normalizeRoster(state.value.roster)
    patchState({
      participants: participantsFromRosterIds(heroes, rosterIdA, rosterIdB),
    })
  }

  function addRosterHero(name: string, emoji: string): RosterHero {
    const hero: RosterHero = {
      id: createCustomHeroId(),
      name: name.trim() || '新选手',
      emoji,
    }
    patchState({ roster: [...normalizeRoster(state.value.roster), hero] })
    return hero
  }

  function updateRosterHero(id: string, patch: { name?: string; emoji?: string }) {
    const heroes = normalizeRoster(state.value.roster)
    const target = heroes.find((h) => h.id === id)
    if (!target || target.builtin) return false

    const next = heroes.map((h) =>
      h.id === id
        ? {
            ...h,
            name: patch.name !== undefined ? patch.name.trim() || h.name : h.name,
            emoji: patch.emoji ?? h.emoji,
          }
        : h,
    )
    patchState({ roster: next })
    syncParticipantsFromRoster()
    return true
  }

  function deleteRosterHero(id: string): { ok: boolean; message?: string } {
    const heroes = normalizeRoster(state.value.roster)
    const target = heroes.find((h) => h.id === id)
    if (!target) return { ok: false, message: '选手不存在' }
    if (target.builtin) return { ok: false, message: '内置选手不可删除' }

    const { slotA, slotB } = slotRosterIds()
    if (isHeroInUse(id, slotA, slotB)) {
      return { ok: false, message: '请先取消该选手的出场' }
    }

    patchState({ roster: heroes.filter((h) => h.id !== id) })
    return { ok: true }
  }

  function rosterHero(id: string) {
    return rosterHeroById(normalizeRoster(state.value.roster), id)
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

  function setLayoutDirectionPreset(preset: LayoutDirectionPreset) {
    if (preset === 'custom') return
    patchState({ layoutDirections: layoutDirectionsFromPreset(preset) })
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

    const migrated = migrateParticipantsToRoster(
      state.value.participants,
      state.value.roster,
    )
    patchState(migrated)

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
        patchState({
          participants: cloneParticipants(defaultParticipants()),
          roster: defaultRoster(),
        })
      }
    },
    { deep: true },
  )

  watch(
    () => state.value.roster,
    (value) => {
      if (!value?.length) {
        patchState({ roster: defaultRoster() })
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
    roster,
    completedGames,
    sidesSwapped,
    autoSwapSides,
    scoreNudgeTop,
    currentServer,
    gameWinner,
    matchWinner,
    isMatchOver,
    isLocked,
    winEvent,
    participantName,
    participantEmoji,
    rosterHero,
    score,
    undo,
    dismissWin,
    startNewMatch,
    resetGame,
    resetMatch,
    setMatchFormat,
    setPlayerSlots,
    addRosterHero,
    updateRosterHero,
    deleteRosterHero,
    setFirstServer,
    setThemeId,
    setLayoutDirection,
    setLayoutDirectionPreset,
    setScores,
    toggleSides,
    setAutoSwapSides,
    setScoreNudgeTop,
  }
}
