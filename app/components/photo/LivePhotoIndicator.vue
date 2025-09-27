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

// 计算颜色样式 - 恢复丰富的状态样式
const colorClass = computed(() => {
  switch (indicatorState.value) {
    case 'playing':
      return 'text-white bg-white/20 border-white/30'
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
    class="relative backdrop-blur-md rounded-full pl-1 pr-1.5 py-1 text-[13px] font-bold flex items-center gap-0.5 leading-0 select-none border transition-all duration-300 overflow-hidden"
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
    <!-- 背景光效 -->
    <motion.div
      v-if="isVideoPlaying"
      class="absolute inset-0 rounded-full"
      :animate="{
        background: [
          'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
          'radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
          'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
        ]
      }"
      :transition="{ duration: 1.5, repeat: Infinity }"
    />
    
    <!-- 处理中的流光效果 -->
    <motion.div
      v-if="processingState?.isProcessing"
      class="absolute inset-0 rounded-full"
      :animate="{
        background: [
          'linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
          'linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
          'linear-gradient(225deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
          'linear-gradient(315deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)'
        ]
      }"
      :transition="{ duration: 2, repeat: Infinity, ease: 'linear' }"
    />
    
    <!-- 错误状态的警告效果 -->
    <motion.div
      v-if="processingState?.error"
      class="absolute inset-0 rounded-full"
      :animate="{
        background: [
          'rgba(239, 68, 68, 0.2)',
          'rgba(239, 68, 68, 0.4)',
          'rgba(239, 68, 68, 0.2)'
        ]
      }"
      :transition="{ duration: 0.8, repeat: Infinity }"
    />
    <!-- 内容区域 -->
    <div class="relative z-10 flex items-center gap-0.5">
      <!-- 处理中状态 -->
      <motion.div
        v-if="processingState?.isProcessing"
        class="size-[17px] relative"
        :animate="{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }"
        :transition="{ 
          rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }"
      >
        <Icon
          name="tabler:loader"
          class="size-[17px] drop-shadow-sm"
        />
        <!-- 处理进度环 -->
        <motion.div
          class="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-300"
          :animate="{ rotate: -360 }"
          :transition="{ duration: 1, repeat: Infinity, ease: 'linear' }"
        />
      </motion.div>
      
      <!-- 错误状态 -->
      <motion.div
        v-else-if="processingState?.error"
        class="size-[17px] relative"
        :animate="{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0]
        }"
        :transition="{ 
          duration: 0.8, 
          repeat: Infinity,
          ease: 'easeInOut'
        }"
      >
        <Icon
          name="tabler:alert-triangle"
          class="size-[17px] drop-shadow-sm"
        />
        <!-- 错误脉冲效果 -->
        <motion.div
          class="absolute inset-0 rounded-full border border-red-300"
          :animate="{ 
            scale: [1, 1.5],
            opacity: [0.5, 0]
          }"
          :transition="{ 
            duration: 1, 
            repeat: Infinity,
            ease: 'easeOut'
          }"
        />
      </motion.div>
      
      <!-- 播放中状态 -->
      <motion.div
        v-else-if="isVideoPlaying"
        class="size-[17px] relative"
        :animate="{ 
          scale: [1, 1.15, 1],
          rotate: [0, 2, -2, 0]
        }"
        :transition="{ 
          duration: 1.2, 
          repeat: Infinity,
          ease: 'easeInOut'
        }"
      >
        <Icon
          name="tabler:play"
          class="size-[17px] drop-shadow-lg"
        />
        <!-- 播放波纹效果 -->
        <motion.div
          class="absolute inset-0 rounded-full border border-white/50"
          :animate="{ 
            scale: [1, 1.8],
            opacity: [0.6, 0]
          }"
          :transition="{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: 'easeOut'
          }"
        />
        <!-- 第二层波纹 -->
        <motion.div
          class="absolute inset-0 rounded-full border border-white/30"
          :animate="{ 
            scale: [1, 2.2],
            opacity: [0.3, 0]
          }"
          :transition="{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.3
          }"
        />
      </motion.div>
      
      <!-- 正常状态 -->
      <motion.div
        v-else
        class="size-[17px] relative"
        :whileHover="{ 
          scale: 1.1,
          rotate: [0, -2, 2, 0]
        }"
        :transition="{ duration: 0.3 }"
      >
        <Icon
          name="tabler:live-photo"
          class="size-[17px] drop-shadow-sm"
        />
        <!-- 待机呼吸效果 -->
        <motion.div
          class="absolute inset-0 rounded-full border border-white/30"
          :animate="{ 
            scale: [1, 1.3],
            opacity: [0, 0.3, 0]
          }"
          :transition="{ 
            duration: 3, 
            repeat: Infinity,
            ease: 'easeInOut'
          }"
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
