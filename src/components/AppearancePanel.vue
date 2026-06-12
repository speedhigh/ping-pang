<script setup lang="ts">
import type { ThemeConfig } from '../themes/config'
import {
  DIRECTION_OPTIONS,
  DIRECTION_PRESET_OPTIONS,
  getLayoutDirectionPreset,
  type LayoutDirection,
  type LayoutDirectionPreset,
  type LayoutDirectionTarget,
  type LayoutDirections,
} from '../utils/layoutDirection'

const props = defineProps<{
  open: boolean
  layoutDirections: LayoutDirections
  themeId: string
  themes: ThemeConfig[]
  scoreNudgeTop: number
}>()

const emit = defineEmits<{
  close: []
  'update:layoutDirection': [target: LayoutDirectionTarget, direction: LayoutDirection]
  'update:layoutDirectionPreset': [preset: LayoutDirectionPreset]
  'update:themeId': [id: string]
  'update:scoreNudgeTop': [px: number]
}>()

const customLayoutOpen = ref(false)

const directionPreset = computed(() => getLayoutDirectionPreset(props.layoutDirections))
const showCustomLayout = computed(() => customLayoutOpen.value)

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
    if (!open) {
      customLayoutOpen.value = false
      return
    }
    customLayoutOpen.value = getLayoutDirectionPreset(props.layoutDirections) === 'custom'
  },
)

function selectLayoutPreset(preset: LayoutDirectionPreset) {
  if (preset === 'custom') {
    customLayoutOpen.value = true
    return
  }
  customLayoutOpen.value = false
  emit('update:layoutDirectionPreset', preset)
}
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
          <h3 class="text-lg font-semibold">外观</h3>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <div class="space-y-5">
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
                统一设置全部文字朝向；需要分别调整时选择「自定义」
              </p>
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="opt in DIRECTION_PRESET_OPTIONS"
                  :key="opt.value"
                  type="button"
                  class="rounded-lg py-2.5 text-sm font-medium transition"
                  :class="
                    opt.value === 'custom'
                      ? showCustomLayout
                        ? 'bg-white text-[#1c1c1e]'
                        : 'bg-white/8 text-[var(--panel-muted)] hover:bg-white/12'
                      : !showCustomLayout && directionPreset === opt.value
                        ? 'bg-white text-[#1c1c1e]'
                        : 'bg-white/8 text-[var(--panel-muted)] hover:bg-white/12'
                  "
                  @click="selectLayoutPreset(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>

              <div v-if="showCustomLayout" class="mt-3 space-y-3">
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

            <fieldset>
              <legend class="mb-2 text-xs text-[var(--panel-muted)]">上方区域上移</legend>
              <p class="mb-3 text-xs leading-relaxed text-[var(--panel-muted)]">
                补偿表头高度，让上方半场分数更靠近表头方向
              </p>
              <div class="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="2"
                  class="min-w-0 flex-1 accent-white"
                  :value="scoreNudgeTop"
                  @input="emit('update:scoreNudgeTop', Number(($event.target as HTMLInputElement).value))"
                />
                <span class="w-10 shrink-0 text-right text-sm tabular-nums text-[var(--panel-muted)]">
                  {{ scoreNudgeTop }}px
                </span>
              </div>
            </fieldset>
          </div>
        </div>

        <footer
          class="shrink-0 border-t border-[var(--panel-border)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            class="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-[#1c1c1e]"
            @click="emit('close')"
          >
            完成
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
