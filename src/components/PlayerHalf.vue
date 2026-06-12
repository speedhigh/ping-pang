<script setup lang="ts">
import type { PlayerId } from '../types/game'
import type { LayoutDirection } from '../utils/layoutDirection'
import { directionRotateClass } from '../utils/layoutDirection'
import { isAtGamePoint } from '../utils/scoring'

const props = defineProps<{
  playerId: PlayerId
  name: string
  score: number
  isServing: boolean
  textDirection: LayoutDirection
  /** 屏幕上的上下半场：top 会向表头方向上移 */
  half: 'top' | 'bottom'
  nudgePx?: number
}>()

const emit = defineEmits<{
  score: [playerId: PlayerId]
}>()

const blockRotateClass = computed(() => directionRotateClass(props.textDirection))
const hasGamePoint = computed(() => isAtGamePoint(props.score))

const contentStyle = computed(() => {
  if (props.half !== 'top' || !props.nudgePx) return undefined
  return { transform: `translateY(-${props.nudgePx}px)` }
})

const ariaLabel = computed(() => {
  let label = `${props.name} 得分，当前 ${props.score} 分`
  if (props.isServing) label += '，发球方'
  if (hasGamePoint.value) label += '，局点'
  return label
})
</script>

<template>
  <button
    type="button"
    class="player-half relative flex h-full w-full min-h-0 items-center justify-center overflow-hidden border-0 p-0 outline-none"
    :class="[
      playerId === 'A' ? 'bg-[var(--player-a-bg)]' : 'bg-[var(--player-b-bg)] player-half--safe-bottom',
      { 'player-half--game-point': hasGamePoint },
    ]"
    :aria-label="ariaLabel"
    @click="emit('score', playerId)"
  >
    <span v-if="hasGamePoint" class="player-half__burn" aria-hidden="true" />
    <span v-if="hasGamePoint" class="player-half__ember" aria-hidden="true" />

    <span
      v-if="isServing"
      class="serve-indicator"
      :class="half === 'top' ? 'serve-indicator--top' : 'serve-indicator--bottom'"
      aria-hidden="true"
    >
      🏓
    </span>

    <div
      class="player-half__content relative z-[1] flex items-center justify-center transition-transform duration-200"
      :style="contentStyle"
    >
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
          class="player-half__name mt-2 inline-flex items-center whitespace-nowrap text-xl font-semibold leading-8 tracking-wide text-[var(--player-text-muted)]"
        >
          {{ name }}
        </span>

        <span v-if="hasGamePoint" class="game-point-badge mt-2">
          局点
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

.player-half--safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.player-half__score-block {
  transform-origin: center center;
}

.player-half__score-slot {
  width: clamp(6.75rem, 42vw, 12rem);
  height: clamp(6.75rem, 42vw, 12rem);
}

.score-digit {
  font-size: clamp(6.75rem, 42vw, 12rem);
}

.serve-indicator {
  position: absolute;
  z-index: 2;
  font-size: clamp(1.375rem, 4.25vw, 1.75rem);
  line-height: 1;
  pointer-events: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.28));
  animation: serve-blink 1.85s ease-in-out infinite;
}

.serve-indicator--top {
  right: clamp(0.875rem, 4vw, 1.25rem);
  bottom: clamp(0.875rem, 4vw, 1.25rem);
}

.serve-indicator--bottom {
  right: clamp(0.875rem, 4vw, 1.25rem);
  top: clamp(0.875rem, 4vw, 1.25rem);
}

@keyframes serve-blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.28;
    transform: scale(0.9);
  }
}

.player-half__burn {
  position: absolute;
  inset: -8%;
  z-index: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(255, 220, 120, 0.55) 0%, transparent 42%),
    radial-gradient(circle at 70% 60%, rgba(255, 120, 60, 0.45) 0%, transparent 48%),
    radial-gradient(circle at 50% 50%, rgba(255, 80, 40, 0.35) 0%, transparent 55%);
  animation: game-point-burn 1.4s ease-in-out infinite alternate;
  pointer-events: none;
}

.player-half__ember {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 160, 80, 0.22) 50%,
    rgba(255, 60, 30, 0.28) 100%
  );
  animation: game-point-flicker 0.85s steps(2, end) infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

.player-half--game-point {
  animation: game-point-bg-pulse 1.2s ease-in-out infinite alternate;
}

.game-point-badge {
  border-radius: 9999px;
  padding: 0.1875rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
  background: rgba(255, 90, 40, 0.45);
  box-shadow:
    0 0 12px rgba(255, 120, 50, 0.65),
    0 0 24px rgba(255, 80, 30, 0.35);
  animation: game-point-badge-glow 1s ease-in-out infinite alternate;
}

@keyframes game-point-burn {
  0% {
    opacity: 0.35;
    transform: scale(0.98) rotate(-1deg);
  }

  100% {
    opacity: 0.85;
    transform: scale(1.06) rotate(1deg);
  }
}

@keyframes game-point-flicker {
  0% {
    opacity: 0.15;
  }

  100% {
    opacity: 0.55;
  }
}

@keyframes game-point-bg-pulse {
  0% {
    filter: brightness(1) saturate(1);
  }

  100% {
    filter: brightness(1.14) saturate(1.25);
  }
}

@keyframes game-point-badge-glow {
  0% {
    transform: scale(0.96);
    box-shadow:
      0 0 8px rgba(255, 120, 50, 0.45),
      0 0 16px rgba(255, 80, 30, 0.2);
  }

  100% {
    transform: scale(1.04);
    box-shadow:
      0 0 16px rgba(255, 160, 80, 0.85),
      0 0 32px rgba(255, 90, 40, 0.45);
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-half--game-point,
  .player-half__burn,
  .player-half__ember,
  .game-point-badge,
  .serve-indicator {
    animation: none;
  }

  .player-half__burn {
    opacity: 0.5;
  }

  .player-half__ember {
    opacity: 0.3;
  }

  .serve-indicator {
    opacity: 1;
  }
}
</style>
