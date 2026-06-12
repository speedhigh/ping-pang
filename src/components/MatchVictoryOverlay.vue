<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import { getTheme } from '../themes/config'
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
const previewUrl = ref<string | null>(null)

function winnerLabel(id: PlayerId): string {
  return id === 'A' ? props.nameA : props.nameB
}

function gameRowBackground(winnerId: PlayerId): string {
  const theme = getTheme(document.documentElement.dataset.theme ?? 'arena-duo')
  const hex = winnerId === 'A' ? theme.playerA : theme.playerB
  return `${hex}24`
}

async function saveScreenshot() {
  if (!cardRef.value || saving.value) return
  saving.value = true
  try {
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: '#ffffff',
      scale: window.devicePixelRatio || 2,
      useCORS: true,
    })
    previewUrl.value = canvas.toDataURL('image/png')

    // 桌面端额外尝试直接下载
    if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const link = document.createElement('a')
      link.download = `乒乓球计分器-${Date.now()}.png`
      link.href = previewUrl.value
      link.click()
    }
  } catch {
    window.alert('生成截图失败，请重试')
  } finally {
    saving.value = false
  }
}

function closePreview() {
  previewUrl.value = null
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-[var(--panel-bg)] sm:items-center">
    <div class="flex max-h-[92dvh] w-full max-w-md flex-col px-4 pb-6 pt-4 sm:pb-4">
      <div ref="cardRef" class="overflow-hidden rounded-3xl shadow-2xl">
        <div class="bg-[var(--player-a-bg)] px-6 py-5 text-center">
          <div class="mb-2 text-4xl">🏆</div>
          <h2 class="text-xl font-bold text-white">
            {{ winnerName }} 取得了最终的胜利
          </h2>
          <p class="mt-1 text-sm text-white/75">
            {{ matchFormatLabel(matchFormat) }} · {{ event.gameWinsA }} : {{ event.gameWinsB }}
          </p>
        </div>

        <div class="bg-[var(--hub-bg)] px-5 py-4">
          <p class="mb-3 text-center text-xs font-medium tracking-widest text-[var(--hub-muted)] uppercase">
            各局比分
          </p>
          <div class="space-y-2">
            <div
              v-for="game in event.completedGames"
              :key="game.gameIndex"
              class="flex items-center justify-between rounded-xl px-4 py-3"
              :style="{ background: gameRowBackground(game.winnerId) }"
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

          <div class="mt-4 flex justify-between border-t border-black/8 pt-3 text-xs text-[var(--hub-muted)]">
            <span>{{ nameA }}</span>
            <span>vs</span>
            <span>{{ nameB }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <button
          type="button"
          class="w-full rounded-full border border-white/20 bg-white/10 py-3 text-sm font-medium text-[var(--panel-text)] transition active:bg-white/20 disabled:opacity-50"
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

  <!-- 全屏预览：长按保存（手机通用） -->
  <Teleport to="body">
    <div
      v-if="previewUrl"
      class="preview-layer fixed inset-0 z-[60] flex flex-col bg-black"
    >
      <div class="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p class="text-sm text-white/80">
          长按图片保存到相册
        </p>
        <button
          type="button"
          class="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white"
          @click="closePreview"
        >
          关闭
        </button>
      </div>

      <div class="flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        <img
          :src="previewUrl"
          alt="战绩截图"
          class="max-h-full max-w-full rounded-2xl object-contain"
        />
      </div>

      <p class="shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-white/50">
        乒乓球计分器
      </p>
    </div>
  </Teleport>
</template>

<style scoped>
.preview-layer img {
  -webkit-touch-callout: default;
  user-select: auto;
}
</style>
