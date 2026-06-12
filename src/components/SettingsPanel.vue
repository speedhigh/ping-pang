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
        class="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-[var(--panel-bg)] p-6 pb-10 text-[var(--panel-text)] sm:rounded-2xl"
        @click.stop
      >
        <h3 class="mb-5 text-lg font-semibold">设置</h3>

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
            <div class="space-y-1">
              <label
                v-for="opt in formatOptions"
                :key="opt.value"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-white/6"
              >
                <input
                  type="radio"
                  name="matchFormat"
                  :value="opt.value"
                  :checked="matchFormat === opt.value"
                  class="accent-white"
                  @change="emit('update:matchFormat', opt.value)"
                />
                {{ opt.label }}
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend class="mb-2 text-xs text-[var(--panel-muted)]">首局发球方</legend>
            <div class="flex gap-4">
              <label
                v-for="id in (['A', 'B'] as PlayerId[])"
                :key="id"
                class="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="firstServer"
                  :value="id"
                  :checked="firstServer === id"
                  class="accent-white"
                  @change="emit('update:firstServer', id)"
                />
                选手 {{ id }}
              </label>
            </div>
          </fieldset>
        </div>

        <div class="mt-6 flex gap-3">
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
      </div>
    </div>
  </Teleport>
</template>
