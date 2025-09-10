<script lang="ts" setup>
import { motion } from 'motion-v'

defineProps<{
  photo: Photo
  isVideoPlaying: boolean
  processingState?: {
    isProcessing: boolean
    progress: number
  } | null
}>()
</script>

<template>
  <motion.div
    v-if="photo.isLivePhoto"
    class="backdrop-blur-md rounded-full pl-1 pr-1.5 py-1 text-[13px] font-bold flex items-center gap-0.5 leading-0 select-none transition-colors duration-300"
    :class="`${isVideoPlaying ? 'text-yellow-300 bg-yellow-300/10' : 'text-white bg-black/30'}`"
    :animate="{
      scale: isVideoPlaying ? 1.1 : 1,
    }"
    :transition="{
      duration: 0.3,
      ease: 'easeInOut',
    }"
  >
    <!-- TODO: Apple style loading -->
    <Icon
      name="tabler:live-photo"
      class="size-[17px]"
    />
    <span>实况</span>

    <!-- Processing progress indicator -->
    <div
      v-if="processingState?.isProcessing"
      class="ml-1 flex items-center gap-1"
    >
      <div class="size-1 bg-white/70 rounded-full animate-pulse" />
      <span class="text-[10px] text-white/80">
        {{ Math.round(processingState.progress || 0) }}%
      </span>
    </div>
  </motion.div>
</template>

<style scoped></style>
