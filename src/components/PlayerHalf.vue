<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerId } from '../types/game'
import type { LayoutDirection } from '../utils/layoutDirection'
import { directionRotateClass } from '../utils/layoutDirection'

const props = defineProps<{
  playerId: PlayerId
  name: string
  score: number
  isServing: boolean
  textDirection: LayoutDirection
}>()

const emit = defineEmits<{
  score: [playerId: PlayerId]
}>()

const blockRotateClass = computed(() => directionRotateClass(props.textDirection))
</script>

<template>
  <button
    type="button"
    class="player-half relative flex h-full w-full min-h-0 items-center justify-center overflow-hidden border-0 p-0 outline-none"
    :class="playerId === 'A' ? 'bg-[var(--player-a-bg)]' : 'bg-[var(--player-b-bg)]'"
    :aria-label="`${name} 得分，当前 ${score} 分${isServing ? '，发球方' : ''}`"
    @click="emit('score', playerId)"
  >
    <div class="player-half__content relative z-[1] flex items-center justify-center">
      <div
        class="player-half__score-block flex flex-col items-center transition-transform duration-200"
        :class="blockRotateClass"
      >
        <div class="player-half__score-slot flex items-center justify-center">
          <span
            class="score-digit inline-flex items-center justify-center font-black tabular-nums leading-none tracking-tighter text-[var(--player-text)]"
          >
            {{ score }}
          </span>
        </div>

        <span
          class="player-half__name mt-1 inline-flex items-center gap-1 whitespace-nowrap text-base font-semibold leading-6 tracking-wide text-[var(--player-text-muted)]"
        >
          <span v-if="isServing" class="serve-emoji text-[1.125rem] leading-none" aria-hidden="true">
            🏓
          </span>
          {{ name }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.player-half {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.player-half__score-block {
  transform-origin: center center;
}

.player-half__score-slot {
  width: clamp(5.5rem, 32vw, 9.5rem);
  height: clamp(5.5rem, 32vw, 9.5rem);
}

.score-digit {
  font-size: clamp(5.5rem, 32vw, 9.5rem);
}
</style>
