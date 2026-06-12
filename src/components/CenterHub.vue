<script setup lang="ts">
import { computed } from 'vue'
import type { MatchFormat } from '../types/game'
import type { LayoutDirections } from '../utils/layoutDirection'
import { directionRotateClass } from '../utils/layoutDirection'
import { matchFormatLabel } from '../utils/scoring'

const props = defineProps<{
  layoutDirections: LayoutDirections
  matchFormat: MatchFormat
  currentGameIndex: number
  gameWinsA: number
  gameWinsB: number
  isLocked: boolean
}>()

const emit = defineEmits<{
  undo: []
  resetGame: []
}>()

const showSeries = computed(() => props.matchFormat !== 'none')
const hubRotateClass = computed(() => directionRotateClass(props.layoutDirections.hub))
const gameWinsARotateClass = computed(() => directionRotateClass(props.layoutDirections.gameWinsA))
const gameWinsBRotateClass = computed(() => directionRotateClass(props.layoutDirections.gameWinsB))
</script>

<template>
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
  >
    <div class="flex items-center gap-2.5">
      <div
        v-if="showSeries"
        class="series-score pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.625rem] border-2 border-white/90 text-lg font-bold text-white shadow-md transition-transform duration-200"
        :class="gameWinsARotateClass"
        style="background: var(--player-a-bg)"
      >
        {{ gameWinsA }}
      </div>

      <div
        class="pointer-events-auto flex h-[6.25rem] w-[6.25rem] shrink-0 flex-col items-center justify-center rounded-full bg-[var(--hub-bg)] shadow-[var(--hub-shadow)] transition-transform duration-200"
        :class="hubRotateClass"
      >
        <span class="text-[0.625rem] font-medium text-[var(--hub-muted)]">
          {{ showSeries ? matchFormatLabel(matchFormat) : '单场' }}
        </span>
        <span class="mt-0.5 flex items-baseline leading-none">
          <span class="text-[1.625rem] font-bold tabular-nums text-[var(--hub-text)]">
            {{ showSeries ? currentGameIndex : '11' }}
          </span>
          <span class="ml-0.5 text-sm font-semibold text-[var(--hub-muted)]">
            {{ showSeries ? '局' : '分' }}
          </span>
        </span>

        <div class="mt-2 flex items-center gap-2">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-[var(--hub-text)] transition active:bg-black/8 disabled:opacity-30"
            :disabled="isLocked"
            aria-label="撤销"
            @click.stop="emit('undo')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 14 4 9l5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 9h10.5a5.5 5.5 0 1 1 0 11H11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-[var(--hub-text)] transition active:bg-black/8 disabled:opacity-30"
            :disabled="isLocked"
            aria-label="重置本局"
            @click.stop="emit('resetGame')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 12a9 9 0 1 1-2.64-6.36"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M21 3v6h-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="showSeries"
        class="series-score pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.625rem] border-2 border-white/90 text-lg font-bold text-white shadow-md transition-transform duration-200"
        :class="gameWinsBRotateClass"
        style="background: var(--player-b-bg)"
      >
        {{ gameWinsB }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.series-score {
  transform-origin: center center;
}
</style>
