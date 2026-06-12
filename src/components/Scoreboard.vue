<script setup lang="ts">
import type { MatchFormat, PlayerId } from '../types/game'
import type { LayoutDirections } from '../utils/layoutDirection'

const props = defineProps<{
  layoutDirections: LayoutDirections
  chromeOffset: number
  nameA: string
  nameB: string
  emojiA: string
  emojiB: string
  scoreA: number
  scoreB: number
  isServingA: boolean
  isServingB: boolean
  matchFormat: MatchFormat
  currentGameIndex: number
  gameWinsA: number
  gameWinsB: number
  sidesSwapped: boolean
  scoreNudgeTop: number
  isLocked: boolean
}>()

const emit = defineEmits<{
  score: [playerId: PlayerId]
  undo: []
  resetGame: []
}>()

const topPlayerId = computed<PlayerId>(() => (props.sidesSwapped ? 'B' : 'A'))
const bottomPlayerId = computed<PlayerId>(() => (props.sidesSwapped ? 'A' : 'B'))

const topNudgePx = computed(() =>
  Math.round(props.chromeOffset * 0.22 + props.scoreNudgeTop),
)

function playerName(id: PlayerId): string {
  return id === 'A' ? props.nameA : props.nameB
}

function playerEmoji(id: PlayerId): string {
  return id === 'A' ? props.emojiA : props.emojiB
}

function playerScore(id: PlayerId): number {
  return id === 'A' ? props.scoreA : props.scoreB
}

function playerServing(id: PlayerId): boolean {
  return id === 'A' ? props.isServingA : props.isServingB
}

function scoreDirection(id: PlayerId) {
  return id === 'A' ? props.layoutDirections.scoreA : props.layoutDirections.scoreB
}
</script>

<template>
  <div
    class="relative h-full w-full"
    :style="{ '--table-chrome-offset': `${chromeOffset}px` }"
  >
    <div class="table-split grid h-full w-full">
      <PlayerHalf
        :player-id="topPlayerId"
        half="top"
        :nudge-px="topNudgePx"
        :text-direction="scoreDirection(topPlayerId)"
        :name="playerName(topPlayerId)"
        :emoji="playerEmoji(topPlayerId)"
        :score="playerScore(topPlayerId)"
        :is-serving="playerServing(topPlayerId)"
        @score="emit('score', $event)"
      />
      <PlayerHalf
        :player-id="bottomPlayerId"
        half="bottom"
        :text-direction="scoreDirection(bottomPlayerId)"
        :name="playerName(bottomPlayerId)"
        :emoji="playerEmoji(bottomPlayerId)"
        :score="playerScore(bottomPlayerId)"
        :is-serving="playerServing(bottomPlayerId)"
        @score="emit('score', $event)"
      />
    </div>

    <CenterHub
      :layout-directions="layoutDirections"
      :match-format="matchFormat"
      :current-game-index="currentGameIndex"
      :game-wins-a="gameWinsA"
      :game-wins-b="gameWinsB"
      :sides-swapped="sidesSwapped"
      :is-locked="isLocked"
      @undo="emit('undo')"
      @reset-game="emit('resetGame')"
    />
  </div>
</template>

<style scoped>
.table-split {
  grid-template-rows:
    calc(50% - var(--table-chrome-offset, 0px) / 2)
    calc(50% + var(--table-chrome-offset, 0px) / 2);
}
</style>
