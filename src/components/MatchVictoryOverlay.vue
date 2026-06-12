<script setup lang="ts">
import { getTheme } from '../themes/config'
import type { PlayerId, WinEvent } from '../types/game'
import { hexToRgba } from '../utils/color'
import { matchFormatLabel, summarizeCompletedGames } from '../utils/scoring'

const props = defineProps<{
  event: WinEvent
  winnerName: string
  nameA: string
  nameB: string
  matchFormat: 'bestOf3' | 'bestOf5'
  themeId: string
}>()

const emit = defineEmits<{
  newMatch: []
}>()

const theme = computed(() => getTheme(props.themeId))
const winnerBg = computed(() => winnerColor(props.event.winnerId))
const summary = computed(() => summarizeCompletedGames(props.event.completedGames))

const netScoreLabel = computed(() => {
  const diff = summary.value.netScoreA
  if (diff > 0) return `${props.nameA} 净胜 ${diff} 分`
  if (diff < 0) return `${props.nameB} 净胜 ${Math.abs(diff)} 分`
  return '总得分持平'
})

function winnerLabel(id: PlayerId): string {
  return id === 'A' ? props.nameA : props.nameB
}

function winnerColor(id: PlayerId): string {
  return id === 'A' ? theme.value.playerA : theme.value.playerB
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="overlay-fullscreen">
      <div class="flex min-h-0 flex-1 flex-col items-stretch justify-end px-4 pt-4 sm:items-center sm:justify-center">
        <div class="flex min-h-0 w-full max-w-md flex-1 flex-col sm:max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] sm:flex-none">
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.28)] sm:flex-none">
            <div class="shrink-0 px-6 py-5 text-center text-white" :style="{ background: winnerBg }">
              <div class="mb-2 text-4xl">🏆</div>
              <h2 class="text-xl font-bold leading-snug">
                {{ winnerName }} 取得了最终的胜利
              </h2>
              <p class="mt-1.5 text-sm text-white/80">
                {{ matchFormatLabel(matchFormat) }} · 大局 {{ event.gameWinsA }} : {{ event.gameWinsB }}
              </p>
            </div>

            <div class="flex min-h-0 flex-1 flex-col bg-[var(--hub-bg)] text-[var(--hub-text)] sm:max-h-[min(60dvh,28rem)]">
              <div
                class="mx-5 mt-4 shrink-0 rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3 text-center"
              >
                <p class="text-[11px] font-semibold tracking-widest text-[var(--hub-muted)]">
                  总得分
                </p>
                <p class="mt-1 text-2xl font-bold tabular-nums">
                  {{ summary.totalScoreA }} : {{ summary.totalScoreB }}
                </p>
                <p class="mt-1 text-xs text-[var(--hub-muted)]">
                  共 {{ summary.gameCount }} 局 · {{ netScoreLabel }}
                </p>
              </div>

              <p class="mb-2 mt-4 shrink-0 px-5 text-center text-[11px] font-semibold tracking-widest text-[var(--hub-muted)]">
                各局比分
              </p>

              <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
                <div class="space-y-2 pb-2">
                  <div
                    v-for="game in event.completedGames"
                    :key="game.gameIndex"
                    class="flex items-center justify-between gap-2 rounded-xl px-4 py-3"
                    :style="{
                      background: hexToRgba(winnerColor(game.winnerId), 0.14),
                    }"
                  >
                    <span class="text-sm font-medium text-[var(--hub-muted)]">
                      第 {{ game.gameIndex }} 局
                    </span>

                    <span class="shrink-0 text-lg font-bold tabular-nums">
                      {{ game.scoreA }} : {{ game.scoreB }}
                    </span>

                    <span
                      class="max-w-[5rem] truncate text-sm font-semibold"
                      :style="{ color: winnerColor(game.winnerId) }"
                    >
                      {{ winnerLabel(game.winnerId) }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="mx-5 mb-4 mt-2 flex shrink-0 justify-between border-t border-black/8 pt-3 text-xs text-[var(--hub-muted)]"
              >
                <span>{{ nameA }}</span>
                <span>vs</span>
                <span>{{ nameB }}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="mt-4 mb-2 shrink-0 w-full rounded-full py-3 text-sm font-semibold text-white transition active:brightness-90 sm:mb-0"
            :style="{ background: winnerBg }"
            @click="emit('newMatch')"
          >
            新的一局
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
