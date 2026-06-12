<script setup lang="ts">
import { EMOJI_CATEGORIES, selectableEmojis } from '../data/emojiLibrary'

const props = defineProps<{
  open: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [emoji: string]
  close: []
}>()

const activeCategory = ref(EMOJI_CATEGORIES[0]!.id)

const currentEmojis = computed(() =>
  EMOJI_CATEGORIES.find((c) => c.id === activeCategory.value)?.emojis ?? selectableEmojis(),
)

function pick(emoji: string) {
  emit('update:modelValue', emoji)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-2xl bg-[var(--panel-bg)] text-[var(--panel-text)] sm:rounded-2xl"
        @click.stop
      >
        <header class="shrink-0 border-b border-[var(--panel-border)] px-6 py-4">
          <h3 class="text-lg font-semibold">选择头像</h3>
        </header>

        <div class="flex shrink-0 gap-1.5 overflow-x-auto px-4 py-3">
          <button
            v-for="cat in EMOJI_CATEGORIES"
            :key="cat.id"
            type="button"
            class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition"
            :class="
              activeCategory === cat.id
                ? 'bg-white text-[#1c1c1e]'
                : 'bg-white/8 text-[var(--panel-muted)]'
            "
            @click="activeCategory = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="emoji in currentEmojis"
              :key="emoji"
              type="button"
              class="flex aspect-square items-center justify-center rounded-xl text-2xl transition"
              :class="
                modelValue === emoji
                  ? 'bg-white/20 ring-2 ring-white/50'
                  : 'bg-white/5 hover:bg-white/10'
              "
              @click="pick(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
