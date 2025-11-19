<script setup lang="ts">
import { motion } from 'motion-v'

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, x: 20 }"
    :animate="{ opacity: 1, x: 0 }"
    :exit="{ opacity: 0, x: -20 }"
    :transition="{ duration: 0.4, ease: 'easeOut' }"
    class="flex flex-col h-full"
  >
    <!-- Header -->
    <div class="shrink-0 px-6 lg:px-12 py-8 border-b border-white/10">
      <div class="max-w-2xl mx-auto space-y-2">
        <h1 class="text-3xl font-bold tracking-tight text-white">
          {{ title }}
        </h1>
        <p v-if="description" class="text-lg text-neutral-400">
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-12 py-8">
      <div class="max-w-2xl mx-auto h-full">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div v-if="$slots.actions" class="shrink-0 px-6 lg:px-12 py-6 border-t border-white/10">
      <div class="max-w-2xl mx-auto flex items-center justify-end gap-4">
        <slot name="actions" />
      </div>
    </div>
  </motion.div>
</template>
