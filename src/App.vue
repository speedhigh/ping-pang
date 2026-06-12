<script setup lang="ts">
import { usePingPongGame } from './composables/usePingPongGame'
import { useTheme } from './composables/useTheme'
import { useTableChromeOffset } from './composables/useTableChromeOffset'
import { playVictorySound, unlockVictorySound } from './composables/useVictorySound'
import type { MatchFormat, PlayerId } from './types/game'
import { applyOverlayStatusBar, getTheme, restoreStatusBar } from './themes/config'
import type { LayoutDirection, LayoutDirectionPreset, LayoutDirectionTarget } from './utils/layoutDirection'
import { matchFormatLabel } from './utils/scoring'

const game = usePingPongGame()

const {
  scoreA,
  scoreB,
  gameWinsA,
  gameWinsB,
  currentGameIndex,
  matchFormat,
  currentServer,
  isLocked,
  winEvent,
  participants,
  firstServer,
  layoutDirections,
  score,
  undo,
  dismissWin,
  startNewMatch,
  resetGame,
  resetMatch,
  setMatchFormat,
  setParticipantName,
  setFirstServer,
  setLayoutDirection,
  setLayoutDirectionPreset,
  participantName,
  sidesSwapped,
  autoSwapSides,
  scoreNudgeTop,
  toggleSides,
  setAutoSwapSides,
  setScoreNudgeTop,
} = game

const { themes, themeId, setThemeId } = useTheme({
  themeId: game.themeId,
  setThemeId: game.setThemeId,
  sidesSwapped,
})

useWakeLock()

const settingsOpen = ref(false)
const appearanceOpen = ref(false)
const resetGameConfirmOpen = ref(false)
const headerRef = ref<{ rootRef: HTMLElement | null } | null>(null)

const { chromeOffset } = useTableChromeOffset(() => headerRef.value?.rootRef ?? null)

const headerTitle = computed(() =>
  matchFormat.value === 'none' ? '快速比赛' : matchFormatLabel(matchFormat.value),
)

const showMatchVictory = computed(() => {
  const event = winEvent.value
  return (
    event?.type === 'match'
    && matchFormat.value !== 'none'
    && event.completedGames.length > 0
  )
})

const showSimpleWin = computed(() => {
  const event = winEvent.value
  if (!event) return false
  if (showMatchVictory.value) return false
  return true
})

const overlayOpen = computed(
  () =>
    showMatchVictory.value
    || showSimpleWin.value
    || settingsOpen.value
    || appearanceOpen.value
    || resetGameConfirmOpen.value,
)

const victoryOverlayOpen = computed(
  () => showMatchVictory.value || showSimpleWin.value,
)

watchEffect(() => {
  const theme = getTheme(themeId.value)
  const headerPlayer = sidesSwapped.value ? 'B' : 'A'
  if (overlayOpen.value) {
    applyOverlayStatusBar(theme)
  } else {
    restoreStatusBar(theme, headerPlayer)
  }

  if (victoryOverlayOpen.value) {
    document.documentElement.classList.add('victory-overlay-open')
    document.documentElement.style.background = theme.panelBg
    document.body.style.background = theme.panelBg
  } else {
    document.documentElement.classList.remove('victory-overlay-open')
    document.documentElement.style.background = ''
    document.body.style.background = ''
  }
})

watch(winEvent, (event, prev) => {
  if (!event || event === prev) return

  if (
    event.type === 'match'
    && matchFormat.value !== 'none'
    && event.completedGames.length > 0
  ) {
    playVictorySound('match')
    return
  }

  if (event.type === 'game') {
    playVictorySound('game')
    return
  }

  playVictorySound('single')
})

function onScore(playerId: PlayerId) {
  unlockVictorySound()
  score(playerId)
}

function onMatchFormat(format: MatchFormat) {
  setMatchFormat(format)
}

function onFirstServer(id: PlayerId) {
  setFirstServer(id)
}

function onLayoutDirection(target: LayoutDirectionTarget, direction: LayoutDirection) {
  setLayoutDirection(target, direction)
}

function onLayoutDirectionPreset(preset: LayoutDirectionPreset) {
  setLayoutDirectionPreset(preset)
}

function requestResetGame() {
  resetGameConfirmOpen.value = true
}

function confirmResetGame() {
  resetGameConfirmOpen.value = false
  resetGame()
}
</script>

<template>
  <div class="app-shell relative z-[1] flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
    <ScoreboardHeader
      ref="headerRef"
      :title="headerTitle"
      :swap-disabled="isLocked"
      @swap-sides="toggleSides"
      @appearance="appearanceOpen = true"
      @settings="settingsOpen = true"
    />

    <div class="min-h-0 flex-1">
      <Scoreboard
        :chrome-offset="chromeOffset"
        :layout-directions="layoutDirections"
        :name-a="participantName('A')"
        :name-b="participantName('B')"
        :score-a="scoreA"
        :score-b="scoreB"
        :is-serving-a="currentServer === 'A'"
        :is-serving-b="currentServer === 'B'"
        :match-format="matchFormat"
        :current-game-index="currentGameIndex"
        :game-wins-a="gameWinsA"
        :game-wins-b="gameWinsB"
        :sides-swapped="sidesSwapped"
        :score-nudge-top="scoreNudgeTop"
        :is-locked="isLocked"
        @score="onScore"
        @undo="undo"
        @reset-game="requestResetGame"
      />
    </div>

    <ConfirmDialog
      :open="resetGameConfirmOpen"
      title="重置本局"
      message="将清零当前局比分并回到 0 : 0，是否继续？"
      confirm-label="确认重置"
      @confirm="confirmResetGame"
      @cancel="resetGameConfirmOpen = false"
    />

    <MatchVictoryOverlay
      v-if="showMatchVictory && winEvent"
      :event="winEvent"
      :winner-name="participantName(winEvent.winnerId)"
      :name-a="participantName('A')"
      :name-b="participantName('B')"
      :match-format="matchFormat as 'bestOf3' | 'bestOf5'"
      :theme-id="themeId"
      @new-match="startNewMatch"
    />

    <WinOverlay
      v-if="showSimpleWin && winEvent"
      :event="winEvent"
      :winner-name="participantName(winEvent.winnerId)"
      :is-single-game="matchFormat === 'none'"
      @dismiss="dismissWin"
    />

    <AppearancePanel
      :open="appearanceOpen"
      :layout-directions="layoutDirections"
      :theme-id="themeId"
      :themes="themes"
      :score-nudge-top="scoreNudgeTop"
      @close="appearanceOpen = false"
      @update:score-nudge-top="setScoreNudgeTop"
      @update:layout-direction="onLayoutDirection"
      @update:layout-direction-preset="onLayoutDirectionPreset"
      @update:theme-id="setThemeId"
    />

    <SettingsPanel
      :open="settingsOpen"
      :participants="participants"
      :match-format="matchFormat"
      :first-server="firstServer"
      :auto-swap-sides="autoSwapSides"
      @close="settingsOpen = false"
      @update:auto-swap-sides="setAutoSwapSides"
      @update:match-format="onMatchFormat"
      @update:participant="setParticipantName"
      @update:first-server="onFirstServer"
      @reset-match="resetMatch"
    />
  </div>
</template>
