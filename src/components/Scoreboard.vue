<script setup lang="ts">
import CenterHub from './CenterHub.vue'
import PlayerHalf from './PlayerHalf.vue'
import type { PlayerId } from '../types/game'
import type { LayoutDirections } from '../utils/layoutDirection'

defineProps<{
  layoutDirections: LayoutDirections
  nameA: string
  nameB: string
  scoreA: number
  scoreB: number
  isServingA: boolean
  isServingB: boolean
  matchFormat: import('../types/game').MatchFormat
  currentGameIndex: number
  gameWinsA: number
  gameWinsB: number
  isLocked: boolean
}>()

const emit = defineEmits<{
  score: [playerId: PlayerId]
  undo: []
  resetGame: []
}>()
</script>

<template>
  <div class="relative h-full w-full">
    <div class="grid h-full w-full grid-rows-2">
      <PlayerHalf
        player-id="A"
        :text-direction="layoutDirections.scoreA"
        :name="nameA"
        :score="scoreA"
        :is-serving="isServingA"
        @score="emit('score', $event)"
      />
      <PlayerHalf
        player-id="B"
        :text-direction="layoutDirections.scoreB"
        :name="nameB"
        :score="scoreB"
        :is-serving="isServingB"
        @score="emit('score', $event)"
      />
    </div>

    <CenterHub
      :layout-directions="layoutDirections"
      :match-format="matchFormat"
      :current-game-index="currentGameIndex"
      :game-wins-a="gameWinsA"
      :game-wins-b="gameWinsB"
      :is-locked="isLocked"
      @undo="emit('undo')"
      @reset-game="emit('resetGame')"
    />
  </div>
</template>
