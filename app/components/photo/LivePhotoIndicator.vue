<script lang="ts" setup>
import { motion } from 'motion-v'
import { computed } from 'vue'

const props = defineProps<{
  photo: Photo
  isVideoPlaying: boolean
  processingState?: {
    isProcessing: boolean
    progress: number
    error?: string | null
    retryCount?: number
  } | null
}>()

// 计算指示器状态
const indicatorState = computed(() => {
  if (props.processingState?.isProcessing) {
    return 'processing'
  }
  if (props.processingState?.error) {
    return 'error'
  }
  if (props.isVideoPlaying) {
    return 'playing'
  }
  return 'ready'
})

// 计算显示文本
const displayText = computed(() => {
  const state = props.processingState
  if (state?.isProcessing) {
    if (state.retryCount && state.retryCount > 0) {
      return `重试中 ${state.retryCount}/3`
    }
    return '处理中...'
  }
  if (state?.error) {
    return '处理失败'
  }
  return $t('ui.livePhoto')
})

// 计算颜色样式
const colorClass = computed(() => {
  switch (indicatorState.value) {
    case 'playing':
      return 'text-yellow-300 bg-yellow-300/20 border-yellow-300/30'
    case 'processing':
      return 'text-blue-300 bg-blue-300/20 border-blue-300/30'
    case 'error':
      return 'text-red-300 bg-red-300/20 border-red-300/30'
    case 'ready':
    default:
      return 'text-white bg-black/40 border-white/20'
  }
})
</script>

<template>
  <motion.div
    v-if="photo.isLivePhoto"
    class="backdrop-blur-md rounded-full pl-1 pr-1.5 py-1 text-[13px] font-bold flex items-center gap-0.5 leading-0 select-none border transition-all duration-300"
    :class="colorClass"
    :animate="{
      scale: isVideoPlaying ? 1.08 : indicatorState === 'processing' ? 1.02 : 1,
      rotate: indicatorState === 'error' ? [0, -2, 2, 0] : 0,
    }"
    :transition="{
      duration: indicatorState === 'error' ? 0.5 : 0.3,
      ease: indicatorState === 'error' ? 'easeInOut' : 'easeOut',
    }"
  >
    <!-- 处理中状态 -->
    <motion.div
      v-if="processingState?.isProcessing"
      class="size-[17px] relative"
      :animate="{ rotate: 360 }"
      :transition="{ duration: 1, repeat: Infinity, ease: 'linear' }"
    >
      <Icon
        name="tabler:loader"
        class="size-[17px]"
      />
    </motion.div>
    
    <!-- 错误状态 -->
    <motion.div
      v-else-if="processingState?.error"
      class="size-[17px]"
      :animate="{ scale: [1, 1.1, 1] }"
      :transition="{ duration: 0.6, repeat: Infinity }"
    >
      <Icon
        name="tabler:alert-circle"
        class="size-[17px]"
      />
    </motion.div>
    
    <!-- 播放中状态 -->
    <motion.div
      v-else-if="isVideoPlaying"
      class="size-[17px]"
      :animate="{ scale: [1, 1.1, 1] }"
      :transition="{ duration: 0.8, repeat: Infinity }"
    >
      <Icon
        name="tabler:player-play-filled"
        class="size-[17px]"
      />
    </motion.div>
    
    <!-- 正常状态 -->
    <Icon
      v-else
      name="tabler:live-photo"
      class="size-[17px]"
    />
    
    <span class="truncate">{{ displayText }}</span>

    <!-- 进度条 -->
    <motion.div
      v-if="processingState?.isProcessing"
      class="text-[11px] opacity-80 pl-0.5 min-w-[2ch]"
      :animate="{ opacity: [0.6, 1, 0.6] }"
      :transition="{ duration: 1.5, repeat: Infinity }"
    >
      {{ Math.round(processingState.progress || 0) }}%
    </motion.div>
    
    <!-- 重试计数 -->
    <motion.div
      v-if="processingState?.retryCount && processingState.retryCount > 0"
      class="text-[10px] opacity-60 pl-0.5"
      :animate="{ scale: [1, 1.2, 1] }"
      :transition="{ duration: 0.3 }"
    >
      ({{ processingState.retryCount }}/3)
    </motion.div>
  </motion.div>
</template>

<style scoped></style>
