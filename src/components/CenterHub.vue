<script setup lang="ts">
import type { MatchFormat, PlayerId } from '../types/game'
import type { LayoutDirections } from '../utils/layoutDirection'
import { directionRotateClass } from '../utils/layoutDirection'
import { matchFormatLabel } from '../utils/scoring'

const props = defineProps<{
  layoutDirections: LayoutDirections
  matchFormat: MatchFormat
  currentGameIndex: number
  gameWinsA: number
  gameWinsB: number
  sidesSwapped: boolean
  isLocked: boolean
}>()

const emit = defineEmits<{
  undo: []
  resetGame: []
}>()

const showSeries = computed(() => props.matchFormat !== 'none')
const hubRotateClass = computed(() => directionRotateClass(props.layoutDirections.hub))

const leftPlayerId = computed<PlayerId>(() => (props.sidesSwapped ? 'B' : 'A'))
const rightPlayerId = computed<PlayerId>(() => (props.sidesSwapped ? 'A' : 'B'))

const leftGameWins = computed(() =>
  leftPlayerId.value === 'A' ? props.gameWinsA : props.gameWinsB,
)
const rightGameWins = computed(() =>
  rightPlayerId.value === 'A' ? props.gameWinsA : props.gameWinsB,
)

const leftRotateClass = computed(() =>
  directionRotateClass(
    leftPlayerId.value === 'A'
      ? props.layoutDirections.gameWinsA
      : props.layoutDirections.gameWinsB,
  ),
)
const rightRotateClass = computed(() =>
  directionRotateClass(
    rightPlayerId.value === 'A'
      ? props.layoutDirections.gameWinsA
      : props.layoutDirections.gameWinsB,
  ),
)
</script>

<template>
  <div
    class="hub-anchor pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
  >
    <div class="flex items-center gap-3.5">
      <div
        v-if="showSeries"
        class="series-score pointer-events-auto flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-[0.875rem] border-2 border-white/90 text-2xl font-bold text-white shadow-md transition-transform duration-200"
        :class="leftRotateClass"
        :style="{ background: leftPlayerId === 'A' ? 'var(--player-a-bg)' : 'var(--player-b-bg)' }"
      >
        {{ leftGameWins }}
      </div>

      <div class="hub-ball-shell shrink-0">
        <span class="hub-ball-shadow" aria-hidden="true" />
        <div
          class="hub-ball pointer-events-auto relative flex h-[8.75rem] w-[8.75rem] flex-col items-center overflow-hidden rounded-full transition-transform duration-200"
          :class="hubRotateClass"
        >
          <span class="hub-ball__highlight" aria-hidden="true" />
          <span class="hub-ball__shade" aria-hidden="true" />

          <div class="hub-ball__info relative z-[1] flex flex-col items-center pt-3">
            <span class="text-sm font-medium text-[var(--hub-muted)]">
              {{ showSeries ? matchFormatLabel(matchFormat) : '单场' }}
            </span>
            <span class="mt-1 flex items-baseline leading-none">
              <span class="text-[2.125rem] font-bold tabular-nums text-[var(--hub-text)]">
                {{ showSeries ? currentGameIndex : '11' }}
              </span>
              <span class="ml-0.5 text-lg font-semibold text-[var(--hub-muted)]">
                {{ showSeries ? '局' : '分' }}
              </span>
            </span>
          </div>

          <div class="relative z-[1] mt-auto flex items-center gap-3 pb-3">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full text-[var(--hub-text)] transition active:bg-black/8 disabled:opacity-30"
              :disabled="isLocked"
              aria-label="撤销"
              @click.stop="emit('undo')"
            >
              <ArrowUturnLeftIcon class="hub-icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full text-[var(--hub-text)] transition active:bg-black/8 disabled:opacity-30"
              :disabled="isLocked"
              aria-label="重置本局"
              @click.stop="emit('resetGame')"
            >
              <ArrowPathIcon class="hub-icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showSeries"
        class="series-score pointer-events-auto flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-[0.875rem] border-2 border-white/90 text-2xl font-bold text-white shadow-md transition-transform duration-200"
        :class="rightRotateClass"
        :style="{ background: rightPlayerId === 'A' ? 'var(--player-a-bg)' : 'var(--player-b-bg)' }"
      >
        {{ rightGameWins }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.hub-anchor {
  top: calc(50% - var(--table-chrome-offset, 0px) / 2);
}

.series-score {
  transform-origin: center center;
}

.hub-ball-shell {
  position: relative;
}

.hub-ball-shadow {
  position: absolute;
  bottom: 0.125rem;
  left: 50%;
  z-index: 0;
  width: 72%;
  height: 0.875rem;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0.08) 55%, transparent 72%);
  filter: blur(1.5px);
  transform: translateX(-50%);
  pointer-events: none;
}

.hub-ball {
  position: relative;
  z-index: 1;
  background:
    radial-gradient(circle at 34% 28%, #ffffff 0%, #fafafa 22%, #f0f0f0 48%, #e4e4e4 72%, #d8d8d8 100%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.26),
    0 4px 10px rgba(0, 0, 0, 0.12),
    inset 10px 10px 18px rgba(255, 255, 255, 0.98),
    inset -8px -12px 22px rgba(0, 0, 0, 0.1),
    inset 0 -3px 8px rgba(0, 0, 0, 0.05);
}

.hub-ball__highlight {
  position: absolute;
  top: 10%;
  left: 16%;
  z-index: 0;
  width: 38%;
  height: 28%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.35) 45%, transparent 72%);
  pointer-events: none;
}

.hub-ball__shade {
  position: absolute;
  right: 10%;
  bottom: 12%;
  z-index: 0;
  width: 42%;
  height: 34%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.04) 50%, transparent 72%);
  pointer-events: none;
}

.hub-ball__info {
  transform: translateY(0.25rem);
}

.hub-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
