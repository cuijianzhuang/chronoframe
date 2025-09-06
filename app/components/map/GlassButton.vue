<script lang="ts" setup>
import { motion } from 'motion-v'
import { twMerge } from 'tailwind-merge'

defineEmits<{
  (e: 'click'): void
}>()

withDefaults(
  defineProps<{
    class?: string
  }>(),
  {
    class: '',
  },
)
</script>

<template>
  <motion.button
    :initial="{ scale: 1 }"
    :while-hover="{ scale: 1.1 }"
    :while-press="{ scale: 0.95 }"
    :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
    type="button"
    :class="
      twMerge(
        $props.class,
        'pointer-events-auto flex size-10 items-center justify-center rounded-xl bg-black/20 text-white backdrop-blur-md border border-white/10 shadow-lg shadow-black/25 overflow-hidden',
      )
    "
    @click="$emit('click')"
  >
    <slot />
  </motion.button>
</template>

<style scoped></style>
