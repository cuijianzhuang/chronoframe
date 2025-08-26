<script lang="ts" setup>
import { AnimatePresence, motion } from 'motion-v'

const props = defineProps<{
  dateRange?: string
  locations?: string
  isVisible: boolean
  class?: string
}>()

const shouldShow = computed(() => {
  return props.isVisible && !!props.dateRange
})

const variants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
}
</script>

<template>
  <div>
    <AnimatePresence>
      <motion.div
        v-if="shouldShow"
        class="fixed top-4 left-4 z-50 lg:top-6 lg:left-6"
        :initial="variants.initial"
        :animate="variants.animate"
        :exit="variants.initial"
        :transition="{
          type: 'spring',
          duration: 0.4,
          bounce: 0.15,
        }"
      >
        <div
          class="flex flex-col gap-1 bg-black/60 backdrop-blur-[70px] rounded-xl border border-white/10 px-4 py-2 shadow-2xl"
        >
          <span class="text-white text-4xl font-black">{{ dateRange }}</span>
          <span class="text-white/60 text-xl font-bold">{{ locations }}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped></style>
