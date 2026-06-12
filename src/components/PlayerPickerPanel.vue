<script setup lang="ts">
import type { RosterHero } from '../types/roster'
import { applyRosterTap, slotLabelForRosterId } from '../utils/roster'

const props = defineProps<{
  open: boolean
  roster: RosterHero[]
  slotA: string
  slotB: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [slotA: string, slotB: string]
}>()

const draftA = ref<string | null>(null)
const draftB = ref<string | null>(null)

watch(
  () => props.open,
  (open) => {
    if (open) {
      draftA.value = props.slotA
      draftB.value = props.slotB
    }
  },
)

const canConfirm = computed(() => Boolean(draftA.value && draftB.value))

function slotFor(heroId: string) {
  return slotLabelForRosterId(heroId, draftA.value, draftB.value)
}

function tapHero(heroId: string) {
  const result = applyRosterTap(heroId, draftA.value, draftB.value)
  if (!result.changed) return
  draftA.value = result.slotA
  draftB.value = result.slotB
}

function confirm() {
  if (!draftA.value || !draftB.value) return
  emit('confirm', draftA.value, draftB.value)
  emit('close')
}

function heroById(id: string | null) {
  if (!id) return undefined
  return props.roster.find((h) => h.id === id)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[55] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-2xl bg-[var(--panel-bg)] text-[var(--panel-text)] sm:rounded-2xl"
        @click.stop
      >
        <header
          class="shrink-0 border-b border-[var(--panel-border)] px-6 pb-4 pt-[max(1rem,env(safe-area-inset-top))]"
        >
          <h3 class="text-lg font-semibold">选择出场选手</h3>
          <p class="mt-1 text-xs text-[var(--panel-muted)]">先选 1P，再选 2P；点已选选手可取消</p>
        </header>

        <div class="shrink-0 border-b border-[var(--panel-border)] px-6 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col items-center gap-2 rounded-xl bg-white/5 py-3">
              <span class="text-xs font-medium text-[var(--panel-muted)]">1P</span>
              <RosterAvatar
                v-if="heroById(draftA)"
                :emoji="heroById(draftA)!.emoji"
                :name="heroById(draftA)!.name"
                slot="1P"
                size="lg"
                :show-name="false"
              />
              <span v-else class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-xs text-[var(--panel-muted)]">
                待选
              </span>
            </div>
            <div class="flex flex-col items-center gap-2 rounded-xl bg-white/5 py-3">
              <span class="text-xs font-medium text-[var(--panel-muted)]">2P</span>
              <RosterAvatar
                v-if="heroById(draftB)"
                :emoji="heroById(draftB)!.emoji"
                :name="heroById(draftB)!.name"
                slot="2P"
                size="lg"
                :show-name="false"
              />
              <span v-else class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/20 text-xs text-[var(--panel-muted)]">
                待选
              </span>
            </div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <div class="grid grid-cols-4 gap-3 sm:grid-cols-5">
            <button
              v-for="hero in roster"
              :key="hero.id"
              type="button"
              class="rounded-xl p-1 transition active:scale-[0.97]"
              @click="tapHero(hero.id)"
            >
              <RosterAvatar
                :emoji="hero.emoji"
                :name="hero.name"
                :slot="slotFor(hero.id)"
                size="md"
              />
            </button>
          </div>
        </div>

        <footer
          class="shrink-0 border-t border-[var(--panel-border)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-full border border-[var(--panel-border)] py-2.5 text-sm text-[var(--panel-muted)]"
              @click="emit('close')"
            >
              取消
            </button>
            <button
              type="button"
              class="flex-1 rounded-full bg-white py-2.5 text-sm font-semibold text-[#1c1c1e] disabled:opacity-40"
              :disabled="!canConfirm"
              @click="confirm"
            >
              确定
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
