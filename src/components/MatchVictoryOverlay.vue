<script setup lang="ts">
import { ref } from 'vue'
import html2canvas from 'html2canvas'
import type { PlayerId, WinEvent } from '../types/game'
import { matchFormatLabel } from '../utils/scoring'

const props = defineProps<{
  event: WinEvent
  winnerName: string
  nameA: string
  nameB: string
  matchFormat: 'bestOf3' | 'bestOf5'
}>()

const emit = defineEmits<{
  newMatch: []
}>()

const cardRef = ref<HTMLElement | null>(null)
const saving = ref(false)

function winnerLabel(id: PlayerId): string {
  return id === 'A' ? props.nameA : props.nameB
}

async function saveScreenshot() {
  if (!cardRef.value || saving.value) return
  saving.value = true
  try {
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: null,
      scale: window.devicePixelRatio || 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `乒乓球计分器-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay-bg)] backdrop-blur-md sm:items-center">
    <div class="flex max-h-[92dvh] w-full max-w-md flex-col px-4 pb-6 pt-4 sm:pb-4">
      <!-- 可截图区域 -->
      <div
        ref="cardRef"
        class="overflow-hidden rounded-3xl shadow-2xl"
      >
        <!-- 顶栏装饰 -->
        <div class="bg-[var(--player-a-bg)] px-6 py-5 text-center">
          <div class="mb-2 text-4xl">🏆</div>
          <h2 class="text-xl font-bold text-white">
            {{ winnerName }} 取得了最终的胜利
          </h2>
          <p class="mt-1 text-sm text-white/75">
            {{ matchFormatLabel(matchFormat) }} · {{ event.gameWinsA }} : {{ event.gameWinsB }}
          </p>
        </div>

        <!-- 小局比分列表 -->
        <div class="bg-[var(--hub-bg)] px-5 py-4">
          <p class="mb-3 text-center text-xs font-medium tracking-widest text-[var(--hub-muted)] uppercase">
            各局比分
          </p>
          <div class="space-y-2">
            <div
              v-for="game in event.completedGames"
              :key="game.gameIndex"
              class="flex items-center justify-between rounded-xl px-4 py-3"
              :class="
                game.winnerId === 'A'
                  ? 'bg-[color-mix(in_srgb,var(--player-a-bg)_14%,var(--hub-bg))]'
                  : 'bg-[color-mix(in_srgb,var(--player-b-bg)_14%,var(--hub-bg))]'
              "
            >
              <span class="text-sm font-medium text-[var(--hub-muted)]">
                第 {{ game.gameIndex }} 局
              </span>
              <span class="text-lg font-bold tabular-nums text-[var(--hub-text)]">
                {{ game.scoreA }} : {{ game.scoreB }}
              </span>
              <span
                class="max-w-[5rem] truncate text-sm font-semibold"
                :class="game.winnerId === 'A' ? 'text-[var(--player-a-bg)]' : 'text-[var(--player-b-bg)]'"
              >
                {{ winnerLabel(game.winnerId) }}
              </span>
            </div>
          </div>

          <!-- 选手名对照 -->
          <div class="mt-4 flex justify-between border-t border-black/8 pt-3 text-xs text-[var(--hub-muted)]">
            <span>{{ nameA }}</span>
            <span>vs</span>
            <span>{{ nameB }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮（不在截图内） -->
      <div class="mt-4 space-y-2">
        <button
          type="button"
          class="w-full rounded-full border border-white/20 bg-white/10 py-3 text-sm font-medium text-white backdrop-blur-sm transition active:bg-white/20 disabled:opacity-50"
          :disabled="saving"
          @click="saveScreenshot"
        >
          {{ saving ? '生成中…' : '保存战绩截图' }}
        </button>
        <button
          type="button"
          class="w-full rounded-full py-3 text-sm font-semibold text-white transition active:brightness-90"
          :style="{ background: 'var(--player-a-bg)' }"
          @click="emit('newMatch')"
        >
          新的一局
        </button>
      </div>
    </div>
  </div>
</template>
