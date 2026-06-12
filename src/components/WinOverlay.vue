<script setup lang="ts">
import { computed } from 'vue'
import type { WinEvent } from '../types/game'

const props = defineProps<{
  event: WinEvent
  winnerName: string
  isSingleGame: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const isGameWin = computed(() => props.event.type === 'game')
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--panel-bg)] px-4 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
    style="min-height: 100dvh; min-height: -webkit-fill-available"
  >
    <div
      class="w-full max-w-sm rounded-3xl bg-[var(--hub-bg)] px-8 py-10 text-center shadow-[var(--hub-shadow)]"
    >
      <div class="mb-4 text-5xl">
        {{ isGameWin ? '🎯' : '🏆' }}
      </div>
      <h2 class="mb-2 text-2xl font-bold text-[var(--hub-text)]">
        {{ winnerName }} 获胜
      </h2>
      <p class="text-base text-[var(--hub-muted)]">
        <template v-if="isGameWin">
          第 {{ event.gameIndex }} 局 · {{ event.scoreA }} : {{ event.scoreB }}
        </template>
        <template v-else>
          {{ event.scoreA }} : {{ event.scoreB }}
        </template>
      </p>
      <button
        type="button"
        class="mt-8 w-full rounded-full py-3 text-sm font-semibold text-white transition active:brightness-90"
        :class="event.winnerId === 'A' ? 'bg-[var(--player-a-bg)]' : 'bg-[var(--player-b-bg)]'"
        @click="emit('dismiss')"
      >
        {{ isGameWin ? '下一局' : '继续' }}
      </button>
    </div>
  </div>
</template>
