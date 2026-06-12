<script setup lang="ts">
defineProps<{
  title?: string
  swapDisabled?: boolean
}>()

const emit = defineEmits<{
  settings: []
  appearance: []
  swapSides: []
}>()

const rootRef = ref<HTMLElement | null>(null)

defineExpose({ rootRef })
</script>

<template>
  <header
    ref="rootRef"
    class="relative z-40 flex h-12 shrink-0 items-center justify-between gap-3 bg-[var(--header-bg)] px-4 pt-[env(safe-area-inset-top)] text-[var(--header-text)] transition-colors duration-200"
    style="min-height: calc(3rem + env(safe-area-inset-top))"
  >
    <h1 class="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold tracking-wide">
      {{ title ?? '乒乓球计分器' }}
    </h1>

    <div class="flex shrink-0 items-center">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full transition active:bg-white/15 disabled:opacity-30"
        aria-label="交换场地"
        :disabled="swapDisabled"
        @click="emit('swapSides')"
      >
        <ArrowsUpDownIcon class="h-[1.375rem] w-[1.375rem]" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full transition active:bg-white/15"
        aria-label="外观"
        @click="emit('appearance')"
      >
        <SwatchIcon class="h-[1.375rem] w-[1.375rem]" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full transition active:bg-white/15"
        aria-label="设置"
        @click="emit('settings')"
      >
        <Cog6ToothIcon class="h-[1.375rem] w-[1.375rem]" aria-hidden="true" />
      </button>
    </div>
  </header>
</template>
