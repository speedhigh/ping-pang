<script setup lang="ts">
import type { MatchFormat, Participant, PlayerId } from '../types/game'

const props = defineProps<{
  open: boolean
  participants: Participant[]
  matchFormat: MatchFormat
  firstServer: PlayerId
  autoSwapSides: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:matchFormat': [format: MatchFormat]
  'update:participant': [id: PlayerId, name: string]
  'update:firstServer': [id: PlayerId]
  'update:autoSwapSides': [enabled: boolean]
  resetMatch: []
}>()

const localNames = ref({ A: '', B: '' })
const resetMatchConfirmOpen = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetMatchConfirmOpen.value = false
    }
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

function confirmResetMatch() {
  resetMatchConfirmOpen.value = false
  emit('resetMatch')
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
                    <CheckIcon v-if="matchFormat === opt.value" class="h-3 w-3" aria-hidden="true" />
                  </span>
                  {{ opt.label }}
                </button>
              </div>
            </fieldset>

            <fieldset v-if="matchFormat !== 'none'">
              <legend class="mb-2 text-xs text-[var(--panel-muted)]">场地</legend>
              <label
                class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] bg-white/5 px-4 py-3"
              >
                <span class="min-w-0">
                  <span class="block text-sm font-medium">自动交换场地</span>
                  <span class="mt-0.5 block text-xs leading-relaxed text-[var(--panel-muted)]">
                    每局结束后自动调换上下半场
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
                  :class="autoSwapSides ? 'bg-[var(--player-a-bg)]' : 'bg-white/15'"
                  :aria-checked="autoSwapSides"
                  aria-label="自动交换场地"
                  @click="emit('update:autoSwapSides', !autoSwapSides)"
                >
                  <span
                    class="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left] duration-200"
                    :class="autoSwapSides ? 'left-[1.375rem]' : 'left-0.5'"
                  />
                </button>
              </label>
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
                    <CheckIcon v-if="firstServer === id" class="h-3 w-3" aria-hidden="true" />
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
              @click="resetMatchConfirmOpen = true"
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

    <ConfirmDialog
      :open="resetMatchConfirmOpen"
      title="重置比赛"
      message="将清空全部比分、局数与比赛记录，是否继续？"
      confirm-label="确认重置"
      @confirm="confirmResetMatch"
      @cancel="resetMatchConfirmOpen = false"
    />
  </Teleport>
</template>
