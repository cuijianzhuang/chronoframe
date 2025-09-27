<script lang="ts" setup>
import { motion, AnimatePresence } from 'motion-v'
import { computed } from 'vue'

interface UploadFile {
  file: File
  fileName: string
  fileId: string
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
  stage?: string | null
  progress?: number
  error?: string
  taskId?: number
  uploadProgress?: {
    loaded: number
    total: number
    percentage: number
    speed?: number
    timeRemaining?: number
    speedText?: string
    timeRemainingText?: string
  }
  canAbort?: boolean
  abortUpload?: () => void
}

const props = defineProps<{
  uploadingFile: UploadFile
  fileId: string
}>()

const emit = defineEmits<{
  removeFile: [fileId: string]
}>()

// 计算文件图标
const fileIcon = computed(() => {
  const file = props.uploadingFile.file
  if (file.type.startsWith('image/')) {
    return 'tabler:photo'
  } else if (file.type.startsWith('video/')) {
    return 'tabler:video'
  }
  return 'tabler:file'
})

// 计算状态颜色
const statusColor = computed(() => {
  switch (props.uploadingFile.status) {
    case 'preparing':
      return 'primary'
    case 'uploading':
      return 'primary'
    case 'processing':
      return 'info'
    case 'completed':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'neutral'
  }
})

// 计算状态文本
const statusText = computed(() => {
  switch (props.uploadingFile.status) {
    case 'preparing':
      return '准备中'
    case 'uploading':
      return `上传中 ${props.uploadingFile.progress || 0}%`
    case 'processing':
      return props.uploadingFile.stage
        ? getStageText(props.uploadingFile.stage)
        : '等待处理'
    case 'completed':
      return '完成'
    case 'error':
      return '错误'
    default:
      return '未知'
  }
})

// 获取处理阶段文本
const getStageText = (stage: string) => {
  const stageMap: Record<string, string> = {
    'preprocessing': '预处理中',
    'metadata': '提取元数据',
    'thumbnail': '生成缩略图',
    'exif': '处理EXIF',
    'reverse-geocoding': '地理解析',
    'live-photo': '处理LivePhoto'
  }
  return stageMap[stage] || stage
}

// 计算进度值
const progressValue = computed(() => {
  if (props.uploadingFile.status === 'uploading') {
    return props.uploadingFile.progress || 0
  }
  if (props.uploadingFile.status === 'processing') {
    return props.uploadingFile.stage ? undefined : null
  }
  if (props.uploadingFile.status === 'completed') {
    return 100
  }
  return 0
})

// 文件大小格式化
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
  <motion.div
    class="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-neutral-200 dark:border-neutral-700"
    :initial="{ opacity: 0, scale: 0.95, y: 20 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.95, y: -20 }"
    :transition="{ duration: 0.3, ease: 'easeOut' }"
    layout
  >
    <!-- 文件信息头部 -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- 文件图标 -->
        <motion.div
          class="relative flex-shrink-0"
          :animate="{
            rotate: uploadingFile.status === 'processing' ? 360 : 0
          }"
          :transition="{
            duration: uploadingFile.status === 'processing' ? 2 : 0.3,
            repeat: uploadingFile.status === 'processing' ? Infinity : 0,
            ease: 'linear'
          }"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="{
              'bg-blue-100 dark:bg-blue-900/30': statusColor === 'primary',
              'bg-green-100 dark:bg-green-900/30': statusColor === 'success',
              'bg-red-100 dark:bg-red-900/30': statusColor === 'error',
              'bg-blue-100 dark:bg-blue-900/30': statusColor === 'info',
              'bg-neutral-100 dark:bg-neutral-900/30': statusColor === 'neutral'
            }"
          >
            <Icon
              :name="fileIcon"
              class="w-5 h-5"
              :class="`text-${statusColor}-600 dark:text-${statusColor}-400`"
            />
          </div>
          
          <!-- 状态指示器 -->
          <motion.div
            v-if="uploadingFile.status !== 'completed'"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center"
            :class="{
              'bg-blue-500': uploadingFile.status === 'preparing' || uploadingFile.status === 'uploading',
              'bg-purple-500': uploadingFile.status === 'processing',
              'bg-red-500': uploadingFile.status === 'error'
            }"
            :animate="{
              scale: uploadingFile.status === 'processing' ? [1, 1.2, 1] : 1
            }"
            :transition="{
              duration: 1,
              repeat: uploadingFile.status === 'processing' ? Infinity : 0
            }"
          >
            <Icon
              v-if="uploadingFile.status === 'error'"
              name="tabler:x"
              class="w-2.5 h-2.5 text-white"
            />
            <motion.div
              v-else
              class="w-2 h-2 bg-white rounded-full"
              :animate="{
                opacity: uploadingFile.status === 'processing' ? [0.5, 1, 0.5] : 1
              }"
              :transition="{
                duration: 1.5,
                repeat: uploadingFile.status === 'processing' ? Infinity : 0
              }"
            />
          </motion.div>
          
          <!-- 完成指示器 -->
          <motion.div
            v-if="uploadingFile.status === 'completed'"
            class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center"
            :initial="{ scale: 0 }"
            :animate="{ scale: 1 }"
            :transition="{ delay: 0.2, duration: 0.3, ease: 'backOut' }"
          >
            <Icon
              name="tabler:check"
              class="w-2.5 h-2.5 text-white"
            />
          </motion.div>
        </motion.div>

        <!-- 文件信息 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-medium text-sm truncate text-neutral-900 dark:text-neutral-100">
              {{ uploadingFile.fileName }}
            </p>
            <UBadge
              :color="statusColor"
              variant="soft"
              size="sm"
            >
              {{ statusText }}
            </UBadge>
          </div>
          
          <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{{ formatBytes(uploadingFile.file.size) }}</span>
            <span
              v-if="uploadingFile.uploadProgress?.speedText && uploadingFile.status === 'uploading'"
              class="hidden sm:inline"
            >
              • {{ uploadingFile.uploadProgress.speedText }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2 ml-2">
        <!-- 中止上传按钮 -->
        <motion.div
          v-if="uploadingFile.status === 'uploading' && uploadingFile.canAbort"
          :initial="{ opacity: 0, scale: 0.8 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.8 }"
        >
          <UButton
            size="xs"
            color="red"
            variant="ghost"
            icon="tabler:x"
            @click="uploadingFile.abortUpload?.()"
          >
            中止
          </UButton>
        </motion.div>

        <!-- 清除按钮 -->
        <motion.div
          v-if="uploadingFile.status === 'completed' || uploadingFile.status === 'error'"
          :initial="{ opacity: 0, scale: 0.8 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.8 }"
        >
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="tabler:x"
            @click="emit('removeFile', fileId)"
          >
            清除
          </UButton>
        </motion.div>
      </div>
    </div>

    <!-- 进度条区域 -->
    <AnimatePresence>
      <motion.div
        v-if="uploadingFile.status === 'uploading' || uploadingFile.status === 'processing'"
        :initial="{ opacity: 0, height: 0 }"
        :animate="{ opacity: 1, height: 'auto' }"
        :exit="{ opacity: 0, height: 0 }"
        :transition="{ duration: 0.3 }"
        class="space-y-2"
      >
        <!-- 上传进度 -->
        <div
          v-if="uploadingFile.status === 'uploading'"
          class="space-y-1"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">
              上传进度
            </span>
            <span class="text-xs font-mono text-neutral-600 dark:text-neutral-400">
              {{ uploadingFile.progress }}%
            </span>
          </div>
          
          <motion.div
            class="relative"
            :initial="{ scaleX: 0 }"
            :animate="{ scaleX: 1 }"
            :transition="{ duration: 0.5 }"
          >
            <UProgress
              :model-value="progressValue"
              :color="statusColor"
              class="h-2"
            />
          </motion.div>
          
          <div
            v-if="uploadingFile.uploadProgress?.timeRemainingText"
            class="text-xs text-neutral-500 dark:text-neutral-400"
          >
            剩余时间: {{ uploadingFile.uploadProgress.timeRemainingText }}
          </div>
        </div>

        <!-- 处理进度 -->
        <div
          v-if="uploadingFile.status === 'processing'"
          class="space-y-1"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">
              处理状态
            </span>
            <motion.span
              class="text-xs text-purple-600 dark:text-purple-400"
              :animate="{ opacity: [0.6, 1, 0.6] }"
              :transition="{ duration: 2, repeat: Infinity }"
            >
              {{ getStageText(uploadingFile.stage || 'pending') }}
            </motion.span>
          </div>
          
          <UProgress
            :model-value="progressValue"
            animation="carousel"
            color="purple"
            class="h-2"
          />
        </div>
      </motion.div>
    </AnimatePresence>

    <!-- 错误信息 -->
    <AnimatePresence>
      <motion.div
        v-if="uploadingFile.status === 'error' && uploadingFile.error"
        :initial="{ opacity: 0, height: 0, y: -10 }"
        :animate="{ opacity: 1, height: 'auto', y: 0 }"
        :exit="{ opacity: 0, height: 0, y: -10 }"
        :transition="{ duration: 0.3 }"
        class="mt-3"
      >
        <UAlert
          :description="uploadingFile.error"
          color="red"
          variant="soft"
          icon="tabler:alert-circle"
        />
      </motion.div>
    </AnimatePresence>

    <!-- 成功动画 -->
    <AnimatePresence>
      <motion.div
        v-if="uploadingFile.status === 'completed'"
        :initial="{ opacity: 0, scale: 0.8, y: 10 }"
        :animate="{ 
          opacity: 1, 
          scale: [0.8, 1.1, 1], 
          y: 0,
          backgroundColor: ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0)']
        }"
        :exit="{ opacity: 0, scale: 0.9, y: -10 }"
        :transition="{ 
          duration: 0.6, 
          ease: 'backOut',
          backgroundColor: { duration: 1.2, ease: 'easeInOut' }
        }"
        class="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400 rounded-lg p-2 -m-2"
      >
        <motion.div
          :animate="{ rotate: [0, 360] }"
          :transition="{ duration: 0.5, delay: 0.1 }"
        >
          <Icon name="tabler:check-circle" class="w-4 h-4" />
        </motion.div>
        <span class="text-sm font-medium">处理完成</span>
        
        <!-- 庆祝粒子效果 -->
        <motion.div
          v-for="i in 3"
          :key="`particle-${i}`"
          class="absolute w-1 h-1 bg-green-500 rounded-full pointer-events-none"
          :style="{
            left: `${20 + i * 10}px`,
            top: `${10 + i * 5}px`
          }"
          :animate="{
            y: [-5, -15, -5],
            x: [0, (i - 2) * 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }"
          :transition="{
            duration: 1,
            delay: 0.2 + i * 0.1,
            ease: 'easeOut'
          }"
        />
      </motion.div>
    </AnimatePresence>
  </motion.div>
</template>

<style scoped>
/* 动态颜色类 - 确保Tailwind包含这些类 */
.bg-blue-100,
.bg-blue-900\/30,
.text-blue-600,
.text-blue-400,
.bg-purple-100,
.bg-purple-900\/30,
.text-purple-600,
.text-purple-400,
.bg-green-100,
.bg-green-900\/30,
.text-green-600,
.text-green-400,
.bg-red-100,
.bg-red-900\/30,
.text-red-600,
.text-red-400,
.bg-neutral-100,
.bg-neutral-900\/30,
.text-neutral-600,
.text-neutral-400 {
  /* Tailwind会自动生成这些类 */
}
</style>
