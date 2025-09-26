<script lang="ts" setup>
import { motion } from 'motion-v'
import { twMerge } from 'tailwind-merge'

defineEmits<{
  (e: 'click'): void
}>()

withDefaults(
  defineProps<{
    class?: string
    size?: 'sm' | 'md' | 'lg'
    rounded?: boolean
    icon?: string
  }>(),
  {
    class: '',
    size: 'md',
    rounded: false,
    icon: '',
  },
)

const sizeClasses = {
  sm: 'h-10 min-w-10 text-sm',
  md: 'h-12 min-w-12 text-base',
  lg: 'h-14 min-w-14 text-lg',
}

const iconSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
}
</script>

<template>
  <motion.button
    :initial="{ scale: 0.5, opacity: 0 }"
    :animate="{ scale: 1, opacity: 1 }"
    :while-hover="{ scale: 1.1 }"
    :while-press="{ scale: 0.95 }"
    :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
    type="button"
    :class="
      twMerge(
        'px-2.5 cursor-pointer pointer-events-auto font-medium flex items-center justify-center gap-1.5 bg-white/80 text-neutral-700 backdrop-blur-md border border-neutral-100 shadow-lg shadow-neutral-300/25 dark:bg-neutral-500/50 dark:text-white/80 dark:border-white/10 dark:shadow-black/25 overflow-hidden',
        sizeClasses[$props.size!],
        $props.rounded ? 'rounded-full' : 'rounded-xl',
        $props.class,
      )
    "
    @click="$emit('click')"
  >
    <Icon
      v-if="icon"
      :name="icon"
      :class="twMerge('inline-block shrink-0 -mt-0.5', iconSizeClasses[$props.size!])"
    />
    <slot />
  </motion.button>
</template>

<style scoped></style>
