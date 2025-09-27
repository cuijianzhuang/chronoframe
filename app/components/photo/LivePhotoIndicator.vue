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
    return '处理中'
  }
  if (state?.error) {
    return '失败'
  }
  // 确保显示"实况"文字
  return '实况'
})

// 计算颜色样式 - 更贴近iOS原生设计
const colorClass = computed(() => {
  switch (indicatorState.value) {
    case 'playing':
      return 'text-white bg-black/30 border-white/40 shadow-lg'
    case 'processing':
      return 'text-blue-300 bg-black/40 border-blue-300/50 shadow-lg'
    case 'error':
      return 'text-red-300 bg-black/40 border-red-300/50 shadow-lg'
    case 'ready':
    default:
      return 'text-white bg-black/30 border-white/30 shadow-md'
  }
})
</script>

<template>
  <motion.div
    v-if="photo.isLivePhoto"
    class="relative backdrop-blur-lg rounded-full px-2 py-1 text-[12px] font-medium flex items-center gap-1 leading-none select-none border-0 transition-all duration-300 overflow-hidden"
    :class="colorClass"
    :animate="{
      scale: isVideoPlaying ? 1.05 : indicatorState === 'processing' ? 1.02 : 1,
      opacity: isVideoPlaying ? 0.95 : 1,
    }"
    :transition="{
      duration: 0.2,
      ease: 'easeOut',
    }"
  >
    <!-- 简洁的播放状态光效 -->
    <motion.div
      v-if="isVideoPlaying"
      class="absolute inset-0 rounded-full bg-white/10"
      :animate="{
        opacity: [0.3, 0.1, 0.3]
      }"
      :transition="{ duration: 2, repeat: Infinity, ease: 'easeInOut' }"
    />
    <!-- 内容区域 - 简化设计 -->
    <div class="relative z-10 flex items-center gap-1">
      <!-- 简化的图标显示 -->
      <motion.div
        class="size-[14px] relative flex items-center justify-center"
        :animate="{
          rotate: processingState?.isProcessing ? 360 : 0,
        }"
        :transition="{
          duration: processingState?.isProcessing ? 1 : 0.2,
          repeat: processingState?.isProcessing ? Infinity : 0,
          ease: 'linear'
        }"
      >
        <!-- 处理中状态 -->
        <Icon
          v-if="processingState?.isProcessing"
          name="tabler:loader-2"
          class="size-[14px]"
        />
        
        <!-- 错误状态 -->
        <motion.div
          v-else-if="processingState?.error"
          :animate="{ scale: [1, 1.1, 1] }"
          :transition="{ duration: 1, repeat: Infinity }"
        >
          <Icon
            name="tabler:exclamation-mark"
            class="size-[14px]"
          />
        </motion.div>
        
        <!-- 播放中/正常状态 - 统一使用实况图标 -->
        <Icon
          v-else
          name="tabler:live-photo"
          class="size-[14px]"
          :class="{ 'opacity-90': isVideoPlaying }"
        />
      </motion.div>
      
      <span class="truncate">{{ displayText }}</span>
    </div>

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
