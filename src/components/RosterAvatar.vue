<script setup lang="ts">
import type { PlayerSlot } from '../types/roster'

withDefaults(
  defineProps<{
    emoji: string
    name: string
    slot?: PlayerSlot | null
    size?: 'sm' | 'md' | 'lg'
    showName?: boolean
  }>(),
  {
    slot: null,
    size: 'md',
    showName: true,
  },
)

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-12 w-12 text-xl',
  md: 'h-16 w-16 text-2xl',
  lg: 'h-20 w-20 text-3xl',
}

const ringClass: Record<PlayerSlot, string> = {
  '1P': 'ring-[var(--player-a-bg)]',
  '2P': 'ring-[var(--player-b-bg)]',
}
</script>

<template>
  <div class="flex flex-col items-center gap-1.5">
    <div
      class="relative shrink-0 rounded-full bg-white/12 shadow-sm"
      :class="[
        sizeClass[size],
        slot ? `ring-[3px] ${ringClass[slot]}` : 'ring-1 ring-white/20',
      ]"
    >
      <span class="flex h-full w-full items-center justify-center leading-none">{{ emoji }}</span>
      <span
        v-if="slot"
        class="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-xs font-bold tracking-wider text-white"
      >
        {{ slot }}
      </span>
    </div>
    <span
      v-if="showName"
      class="max-w-[5.5rem] truncate text-center text-xs font-medium text-[var(--panel-text)]"
    >
      {{ name }}
    </span>
  </div>
</template>
