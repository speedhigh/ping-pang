<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string | false
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-6"
      @click.self="emit('cancel')"
    >
      <div
        class="w-full max-w-sm rounded-3xl bg-[var(--hub-bg)] px-6 py-6 shadow-[var(--hub-shadow)]"
        role="alertdialog"
        aria-modal="true"
        :aria-label="title"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-[var(--hub-text)]">
          {{ title }}
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-[var(--hub-muted)]">
          {{ message }}
        </p>

        <div class="mt-6 flex gap-3">
          <button
            v-if="cancelLabel !== false"
            type="button"
            class="flex-1 rounded-full border border-[var(--panel-border)] py-2.5 text-sm font-medium text-[var(--hub-muted)] transition active:bg-black/5"
            @click="emit('cancel')"
          >
            {{ cancelLabel ?? '取消' }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-full bg-[var(--player-a-bg)] py-2.5 text-sm font-semibold text-white transition active:brightness-90"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? '确认' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
