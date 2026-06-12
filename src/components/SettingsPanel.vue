<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MatchFormat, Participant, PlayerId } from '../types/game'
import type { ThemeConfig } from '../themes/config'
import {
  DIRECTION_OPTIONS,
  type LayoutDirection,
  type LayoutDirectionTarget,
  type LayoutDirections,
} from '../utils/layoutDirection'

const props = defineProps<{
  open: boolean
  participants: Participant[]
  matchFormat: MatchFormat
  firstServer: PlayerId
  layoutDirections: LayoutDirections
  themeId: string
  themes: ThemeConfig[]
}>()

const emit = defineEmits<{
  close: []
  'update:matchFormat': [format: MatchFormat]
  'update:participant': [id: PlayerId, name: string]
  'update:firstServer': [id: PlayerId]
  'update:layoutDirection': [target: LayoutDirectionTarget, direction: LayoutDirection]
  'update:themeId': [id: string]
  resetMatch: []
}>()

const localNames = ref({ A: '', B: '' })

const directionRows: { target: LayoutDirectionTarget; label: string }[] = [
  { target: 'scoreA', label: '选手 A 分数' },
  { target: 'gameWinsA', label: '选手 A 大局比分' },
  { target: 'hub', label: '中控区' },
  { target: 'gameWinsB', label: '选手 B 大局比分' },
  { target: 'scoreB', label: '选手 B 分数' },
]

watch(
  () => props.open,
  (open) => {
    if (open) {
      localNames.value = {
        A: props.participants.find((p) => p.id === 'A')?.name ?? '选手A',
        B: props.participants.find((p) => p.id === 'B')?.name ?? '选手B',
      }
    }
  },
)

function saveNames() {
  emit('update:participant', 'A', localNames.value.A)
  emit('update:participant', 'B', localNames.value.B)
  emit('close')
}

const formatOptions: { value: MatchFormat; label: string }[] = [
  { value: 'none', label: '单场（不启用大局）' },
  { value: 'bestOf3', label: '三局两胜' },
  { value: 'bestOf5', label: '五局三胜' },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-[var(--panel-bg)] text-[var(--panel-text)] sm:rounded-2xl"
        @click.stop
      >
        <header
          class="shrink-0 border-b border-[var(--panel-border)] px-6 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]"
        >
          <h3 class="text-lg font-semibold">设置</h3>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <div class="space-y-5">
          <!-- 主题 -->
          <fieldset>
            <legend class="mb-3 text-xs font-medium text-[var(--panel-muted)]">主题</legend>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="theme in themes"
                :key="theme.id"
                type="button"
                class="flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition"
                :class="
                  themeId === theme.id
                    ? 'border-white/40 bg-white/10'
                    : 'border-[var(--panel-border)] bg-white/5'
                "
                @click="emit('update:themeId', theme.id)"
              >
                <span class="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <span class="h-full w-1/2" :style="{ background: theme.playerA }" />
                  <span class="h-full w-1/2" :style="{ background: theme.playerB }" />
                </span>
                <span class="text-sm font-medium">{{ theme.name }}</span>
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend class="mb-3 text-xs font-medium text-[var(--panel-muted)]">布局方向</legend>
            <p class="mb-3 text-xs leading-relaxed text-[var(--panel-muted)]">
              上下分屏不变，可分别调整分数与中控区的文字朝向
            </p>
            <div class="space-y-3">
              <div
                v-for="row in directionRows"
                :key="row.target"
                class="rounded-xl border border-[var(--panel-border)] bg-white/5 p-3"
              >
                <span class="mb-2 block text-sm font-medium">{{ row.label }}</span>
                <div class="grid grid-cols-4 gap-1.5">
                  <button
                    v-for="opt in DIRECTION_OPTIONS"
                    :key="`${row.target}-${opt.value}`"
                    type="button"
                    class="rounded-lg py-2 text-sm font-medium transition"
                    :class="
                      layoutDirections[row.target] === opt.value
                        ? 'bg-white text-[#1c1c1e]'
                        : 'bg-white/8 text-[var(--panel-muted)] hover:bg-white/12'
                    "
                    @click="emit('update:layoutDirection', row.target, opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          <label class="block">
            <span class="mb-1.5 block text-xs text-[var(--panel-muted)]">选手 A</span>
            <input
              v-model="localNames.A"
              type="text"
              maxlength="12"
              class="w-full rounded-xl border border-[var(--panel-border)] bg-white/8 px-3 py-2.5 text-[var(--panel-text)] outline-none focus:border-white/30"
            />
          </label>
          <label class="block">
            <span class="mb-1.5 block text-xs text-[var(--panel-muted)]">选手 B</span>
            <input
              v-model="localNames.B"
              type="text"
              maxlength="12"
              class="w-full rounded-xl border border-[var(--panel-border)] bg-white/8 px-3 py-2.5 text-[var(--panel-text)] outline-none focus:border-white/30"
            />
          </label>

          <fieldset>
            <legend class="mb-2 text-xs text-[var(--panel-muted)]">大局赛制</legend>
            <div class="space-y-2">
              <button
                v-for="opt in formatOptions"
                :key="opt.value"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition active:scale-[0.99]"
                :class="
                  matchFormat === opt.value
                    ? 'border-[var(--player-a-bg)] bg-[var(--player-a-bg)] font-semibold text-white shadow-sm'
                    : 'border-[var(--panel-border)] bg-white/5 font-medium text-[var(--panel-muted)]'
                "
                @click="emit('update:matchFormat', opt.value)"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  :class="
                    matchFormat === opt.value
                      ? 'border-white bg-white text-[var(--player-a-bg)]'
                      : 'border-[var(--panel-muted)] bg-transparent'
                  "
                >
                  <svg
                    v-if="matchFormat === opt.value"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.5"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                {{ opt.label }}
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend class="mb-2 text-xs text-[var(--panel-muted)]">首局发球方</legend>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="id in (['A', 'B'] as PlayerId[])"
                :key="id"
                type="button"
                class="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm transition active:scale-[0.99]"
                :class="
                  firstServer === id
                    ? id === 'A'
                      ? 'border-[var(--player-a-bg)] bg-[var(--player-a-bg)] font-semibold text-white shadow-sm'
                      : 'border-[var(--player-b-bg)] bg-[var(--player-b-bg)] font-semibold text-white shadow-sm'
                    : 'border-[var(--panel-border)] bg-white/5 font-medium text-[var(--panel-muted)]'
                "
                @click="emit('update:firstServer', id)"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  :class="
                    firstServer === id
                      ? 'border-white bg-white'
                      : 'border-[var(--panel-muted)] bg-transparent'
                  "
                  :style="firstServer === id ? { color: id === 'A' ? 'var(--player-a-bg)' : 'var(--player-b-bg)' } : undefined"
                >
                  <svg
                    v-if="firstServer === id"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.5"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                选手 {{ id }}
              </button>
            </div>
          </fieldset>
          </div>
        </div>

        <footer
          class="shrink-0 border-t border-[var(--panel-border)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-full border border-[var(--panel-border)] py-2.5 text-sm text-[var(--panel-muted)]"
              @click="emit('resetMatch'); emit('close')"
            >
              重置比赛
            </button>
            <button
              type="button"
              class="flex-1 rounded-full bg-white py-2.5 text-sm font-semibold text-[#1c1c1e]"
              @click="saveNames"
            >
              完成
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
