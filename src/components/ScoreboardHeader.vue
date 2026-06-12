<script setup lang="ts">
defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  settings: []
}>()
</script>

<template>
  <header
    class="relative z-40 flex h-12 shrink-0 items-center justify-between bg-[var(--header-bg)] px-4 pt-[env(safe-area-inset-top)] text-[var(--player-text)]"
    style="min-height: calc(3rem + env(safe-area-inset-top))"
  >
    <div class="w-10" aria-hidden="true" />

    <h1 class="text-[0.9375rem] font-semibold tracking-wide">
      {{ title ?? '乒乓球计分器' }}
    </h1>

    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full transition active:bg-white/15"
      aria-label="设置"
      @click="emit('settings')"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          stroke-width="1.6"
        />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </header>
</template>
