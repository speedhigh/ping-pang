<script setup lang="ts">
import type { RosterHero } from '../types/roster'
import { isHeroInUse } from '../utils/roster'

const props = defineProps<{
  open: boolean
  roster: RosterHero[]
  slotA: string
  slotB: string
}>()

const emit = defineEmits<{
  close: []
  add: [name: string, emoji: string]
  update: [id: string, patch: { name?: string; emoji?: string }]
  delete: [id: string]
}>()

const editorOpen = ref(false)
const editingId = ref<string | null>(null)
const draftName = ref('')
const draftEmoji = ref('')
const emojiPickerOpen = ref(false)
const deleteError = ref('')
const validationOpen = ref(false)
const deleteConfirmOpen = ref(false)
const deleteTarget = ref<RosterHero | null>(null)

const deleteConfirmMessage = computed(() => {
  const hero = deleteTarget.value
  if (!hero) return ''
  return `确定删除「${hero.name}」吗？此操作无法撤销。`
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      editorOpen.value = false
      editingId.value = null
      deleteError.value = ''
      validationOpen.value = false
      deleteConfirmOpen.value = false
      deleteTarget.value = null
    }
  },
)

const editingHero = computed(() =>
  editingId.value ? props.roster.find((h) => h.id === editingId.value) : undefined,
)

function openAdd() {
  editingId.value = null
  draftName.value = ''
  draftEmoji.value = ''
  editorOpen.value = true
}

function openEdit(hero: RosterHero) {
  if (hero.builtin) return
  editingId.value = hero.id
  draftName.value = hero.name
  draftEmoji.value = hero.emoji
  editorOpen.value = true
}

function saveEditor() {
  const name = draftName.value.trim()
  if (!name || !draftEmoji.value) {
    validationOpen.value = true
    return
  }

  if (editingId.value) {
    emit('update', editingId.value, { name, emoji: draftEmoji.value })
  } else {
    emit('add', name, draftEmoji.value)
  }
  editorOpen.value = false
}

function tryDelete(hero: RosterHero) {
  deleteError.value = ''
  if (hero.builtin) return
  if (isHeroInUse(hero.id, props.slotA, props.slotB)) {
    deleteError.value = '请先取消该选手的出场后再删除'
    return
  }
  deleteTarget.value = hero
  deleteConfirmOpen.value = true
}

function confirmDelete() {
  if (!deleteTarget.value) return
  emit('delete', deleteTarget.value.id)
  deleteConfirmOpen.value = false
  deleteTarget.value = null
}

function cancelDelete() {
  deleteConfirmOpen.value = false
  deleteTarget.value = null
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
          <h3 class="text-lg font-semibold">管理选手池</h3>
          <p class="mt-1 text-xs text-[var(--panel-muted)]">内置选手不可改名或删除</p>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <p v-if="deleteError" class="mb-3 text-xs text-red-300">{{ deleteError }}</p>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <div
              v-for="hero in roster"
              :key="hero.id"
              class="relative rounded-xl bg-white/5 p-2"
            >
              <RosterAvatar :emoji="hero.emoji" :name="hero.name" size="sm" />
              <div v-if="hero.builtin" class="mt-2 text-center text-[10px] text-[var(--panel-muted)]">
                内置
              </div>
              <div v-else class="mt-2 flex justify-center gap-1">
                <button
                  type="button"
                  class="rounded-md bg-white/10 px-2 py-0.5 text-[10px]"
                  @click="openEdit(hero)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-red-200"
                  @click="tryDelete(hero)"
                >
                  删除
                </button>
              </div>
            </div>

            <button
              type="button"
              class="flex min-h-[6.5rem] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/20 bg-white/5 transition active:bg-white/10"
              @click="openAdd"
            >
              <PlusIcon class="h-7 w-7 text-[var(--panel-muted)]" aria-hidden="true" />
              <span class="text-xs text-[var(--panel-muted)]">新增</span>
            </button>
          </div>
        </div>

        <footer
          class="shrink-0 border-t border-[var(--panel-border)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            class="mb-3 w-full rounded-full border border-[var(--panel-border)] py-2.5 text-sm text-[var(--panel-muted)]"
            @click="openAdd"
          >
            + 新增角色
          </button>
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

    <div
      v-if="editorOpen"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      @click.self="editorOpen = false"
    >
      <div
        class="w-full max-w-md rounded-t-2xl bg-[var(--panel-bg)] px-6 py-5 text-[var(--panel-text)] sm:rounded-2xl"
        @click.stop
      >
        <h4 class="mb-5 text-base font-semibold text-white">
          {{ editingHero ? '编辑选手' : '新增选手' }}
        </h4>

        <div class="mb-5">
          <span class="mb-2 block text-xs text-[var(--panel-muted)]">头像</span>
          <button
            type="button"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 transition active:bg-white/15"
            aria-label="选择头像"
            @click="emojiPickerOpen = true"
          >
            <PlusIcon
              v-if="!draftEmoji"
              class="h-7 w-7 text-white/55"
              aria-hidden="true"
            />
            <span v-else class="text-3xl leading-none">{{ draftEmoji }}</span>
          </button>
        </div>

        <label class="mb-5 block">
          <span class="mb-1.5 block text-xs text-[var(--panel-muted)]">名字</span>
          <input
            v-model="draftName"
            type="text"
            maxlength="12"
            placeholder="输入选手名字"
            class="w-full rounded-xl border border-[var(--panel-border)] bg-white/8 px-3 py-2.5 text-[var(--panel-text)] placeholder:text-white/35 outline-none focus:border-white/30"
          />
        </label>

        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-full border border-[var(--panel-border)] py-2.5 text-sm text-[var(--panel-muted)]"
            @click="editorOpen = false"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 rounded-full bg-white py-2.5 text-sm font-semibold text-[#1c1c1e]"
            @click="saveEditor"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="validationOpen"
      title="提示"
      message="请填入完整信息"
      confirm-label="知道了"
      :cancel-label="false"
      @confirm="validationOpen = false"
    />

    <div
      v-if="deleteConfirmOpen"
      class="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      @click.self="cancelDelete"
    >
      <div
        class="w-full max-w-md rounded-t-2xl bg-[var(--panel-bg)] px-6 py-5 text-[var(--panel-text)] sm:rounded-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-label="删除选手"
        @click.stop
      >
        <h4 class="text-base font-semibold text-white">删除选手</h4>
        <p class="mt-2 text-sm leading-relaxed text-[var(--panel-muted)]">
          {{ deleteConfirmMessage }}
        </p>
        <div class="mt-6 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-full border border-[var(--panel-border)] py-2.5 text-sm text-[var(--panel-muted)]"
            @click="cancelDelete"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 rounded-full bg-[var(--player-a-bg)] py-2.5 text-sm font-semibold text-white"
            @click="confirmDelete"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>

    <EmojiPickerSheet
      :open="emojiPickerOpen"
      :model-value="draftEmoji"
      @update:model-value="draftEmoji = $event"
      @close="emojiPickerOpen = false"
    />
  </Teleport>
</template>
