<script setup lang="ts">
import { rosterIdForPlayer } from '../utils/roster'
import type { MatchFormat, Participant, PlayerId } from '../types/game'
import type { RosterHero } from '../types/roster'

const props = defineProps<{
  open: boolean
  participants: Participant[]
  roster: RosterHero[]
  matchFormat: MatchFormat
  firstServer: PlayerId
  autoSwapSides: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:matchFormat': [format: MatchFormat]
  'update:firstServer': [id: PlayerId]
  'update:autoSwapSides': [enabled: boolean]
  'update:playerSlots': [slotA: string, slotB: string]
  addRosterHero: [name: string, emoji: string]
  updateRosterHero: [id: string, patch: { name?: string; emoji?: string }]
  deleteRosterHero: [id: string]
  resetMatch: []
}>()

const resetMatchConfirmOpen = ref(false)
const pickerOpen = ref(false)
const manageOpen = ref(false)

const slotA = computed(() => rosterIdForPlayer(props.participants, 'A'))
const slotB = computed(() => rosterIdForPlayer(props.participants, 'B'))

const heroA = computed(() => props.roster.find((h) => h.id === slotA.value))
const heroB = computed(() => props.roster.find((h) => h.id === slotB.value))

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetMatchConfirmOpen.value = false
      pickerOpen.value = false
      manageOpen.value = false
    }
  },
)

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
            <fieldset>
              <div class="mb-3 flex items-center justify-between gap-2">
                <legend class="text-xs font-medium text-[var(--panel-muted)]">
                  玩家选择 ({{ roster.length }})
                </legend>
                <button
                  type="button"
                  class="shrink-0 text-xs font-medium text-white/80 transition active:opacity-70"
                  @click.stop="manageOpen = true"
                >
                  管理 ›
                </button>
              </div>

              <button
                type="button"
                class="w-full rounded-xl border border-[var(--panel-border)] bg-white/5 p-4 text-left transition active:bg-white/10"
                @click="pickerOpen = true"
              >
                <div class="flex items-center justify-center gap-6">
                  <RosterAvatar
                    v-if="heroA"
                    :emoji="heroA.emoji"
                    :name="heroA.name"
                    slot="1P"
                    size="md"
                  />
                  <span class="text-sm font-medium text-[var(--panel-muted)]">VS</span>
                  <RosterAvatar
                    v-if="heroB"
                    :emoji="heroB.emoji"
                    :name="heroB.name"
                    slot="2P"
                    size="md"
                  />
                </div>
                <p class="mt-3 text-center text-xs text-[var(--panel-muted)]">点击进入选角 ›</p>
              </button>
            </fieldset>

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
                  v-for="slot in ([{ id: 'A' as PlayerId, label: '1P' }, { id: 'B' as PlayerId, label: '2P' }] )"
                  :key="slot.id"
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm transition active:scale-[0.99]"
                  :class="
                    firstServer === slot.id
                      ? slot.id === 'A'
                        ? 'border-[var(--player-a-bg)] bg-[var(--player-a-bg)] font-semibold text-white shadow-sm'
                        : 'border-[var(--player-b-bg)] bg-[var(--player-b-bg)] font-semibold text-white shadow-sm'
                      : 'border-[var(--panel-border)] bg-white/5 font-medium text-[var(--panel-muted)]'
                  "
                  @click="emit('update:firstServer', slot.id)"
                >
                  <span
                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    :class="
                      firstServer === slot.id
                        ? 'border-white bg-white'
                        : 'border-[var(--panel-muted)] bg-transparent'
                    "
                    :style="firstServer === slot.id ? { color: slot.id === 'A' ? 'var(--player-a-bg)' : 'var(--player-b-bg)' } : undefined"
                  >
                    <CheckIcon v-if="firstServer === slot.id" class="h-3 w-3" aria-hidden="true" />
                  </span>
                  {{ slot.label }}
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
              @click="emit('close')"
            >
              完成
            </button>
          </div>
        </footer>
      </div>
    </div>

    <PlayerPickerPanel
      :open="pickerOpen"
      :roster="roster"
      :slot-a="slotA"
      :slot-b="slotB"
      @close="pickerOpen = false"
      @confirm="(a, b) => emit('update:playerSlots', a, b)"
    />

    <RosterManagePanel
      :open="manageOpen"
      :roster="roster"
      :slot-a="slotA"
      :slot-b="slotB"
      @close="manageOpen = false"
      @add="(name, emoji) => emit('addRosterHero', name, emoji)"
      @update="(id, patch) => emit('updateRosterHero', id, patch)"
      @delete="(id) => emit('deleteRosterHero', id)"
    />

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
