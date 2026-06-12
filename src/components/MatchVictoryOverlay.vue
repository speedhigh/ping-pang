<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import { getTheme } from '../themes/config'
import type { PlayerId, WinEvent } from '../types/game'
import { hexToRgba } from '../utils/color'
import { matchFormatLabel } from '../utils/scoring'

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

const cardRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const previewUrl = ref<string | null>(null)

const theme = computed(() => getTheme(props.themeId))

function winnerLabel(id: PlayerId): string {
  return id === 'A' ? props.nameA : props.nameB
}

function winnerColor(id: PlayerId): string {
  return id === 'A' ? theme.value.playerA : theme.value.playerB
}

function gameRowStyle(winnerId: PlayerId) {
  return {
    background: hexToRgba(winnerColor(winnerId), 0.14),
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  }
}

async function saveScreenshot() {
  if (!cardRef.value || saving.value) return
  saving.value = true
  try {
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: theme.value.hubBg,
      scale: Math.min(window.devicePixelRatio || 2, 3),
      useCORS: true,
      logging: false,
    })
    previewUrl.value = canvas.toDataURL('image/png')

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
      <!-- 截图区域：全部 inline 样式，避免 html2canvas 丢失 CSS 变量 -->
      <div
        ref="cardRef"
        :style="{
          overflow: 'hidden',
          borderRadius: '24px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          width: '100%',
        }"
      >
        <div
          :style="{
            background: theme.playerA,
            padding: '20px 24px',
            textAlign: 'center',
            color: '#ffffff',
          }"
        >
          <div :style="{ fontSize: '36px', marginBottom: '8px' }">🏆</div>
          <h2 :style="{ fontSize: '20px', fontWeight: 700, margin: 0, lineHeight: 1.35 }">
            {{ winnerName }} 取得了最终的胜利
          </h2>
          <p :style="{ margin: '6px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.78)' }">
            {{ matchFormatLabel(matchFormat) }} · {{ event.gameWinsA }} : {{ event.gameWinsB }}
          </p>
        </div>

        <div
          :style="{
            background: theme.hubBg,
            padding: '16px 20px 18px',
            color: theme.hubText,
          }"
        >
          <p
            :style="{
              margin: '0 0 12px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: theme.hubMuted,
            }"
          >
            各局比分
          </p>

          <div>
            <div
              v-for="game in event.completedGames"
              :key="game.gameIndex"
              :style="gameRowStyle(game.winnerId)"
            >
              <span :style="{ fontSize: '14px', fontWeight: 500, color: theme.hubMuted }">
                第 {{ game.gameIndex }} 局
              </span>
              <span :style="{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }">
                {{ game.scoreA }} : {{ game.scoreB }}
              </span>
              <span
                :style="{
                  maxWidth: '5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: winnerColor(game.winnerId),
                }"
              >
                {{ winnerLabel(game.winnerId) }}
              </span>
            </div>
          </div>

          <div
            :style="{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: theme.hubMuted,
            }"
          >
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
