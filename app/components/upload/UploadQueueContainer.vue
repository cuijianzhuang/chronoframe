<script lang="ts" setup>
import { motion, AnimatePresence } from 'motion-v'
import { computed, ref } from 'vue'

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
  uploadingFiles: Map<string, UploadFile>
  collapsed?: boolean
}>()

const emit = defineEmits<{
  removeFile: [fileId: string]
  clearCompleted: []
  clearAll: []
  toggle: []
}>()

const isCollapsed = ref(props.collapsed || false)

// 计算统计信息
const stats = computed(() => {
  const files = Array.from(props.uploadingFiles.values())
  return {
    total: files.length,
    uploading: files.filter(f => f.status === 'uploading').length,
    processing: files.filter(f => f.status === 'processing').length,
    completed: files.filter(f => f.status === 'completed').length,
    error: files.filter(f => f.status === 'error').length,
    active: files.filter(f => f.status === 'uploading' || f.status === 'processing').length,
  }
})

// 计算整体进度
const overallProgress = computed(() => {
  const files = Array.from(props.uploadingFiles.values())
  if (files.length === 0) return 0
  
  let totalProgress = 0
  files.forEach(file => {
    if (file.status === 'completed') {
      totalProgress += 100
    } else if (file.status === 'uploading' && file.progress !== undefined) {
      totalProgress += file.progress
    } else if (file.status === 'processing') {
      totalProgress += 50 // 估算处理进度为50%
    }
  })
  
  return Math.round(totalProgress / files.length)
})

// 计算状态颜色
const statusColor = computed(() => {
  if (stats.value.error > 0) return 'red'
  if (stats.value.active > 0) return 'blue'
  if (stats.value.completed > 0 && stats.value.active === 0) return 'green'
  return 'neutral'
})

// 切换折叠状态
const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle')
}

// 清除已完成的文件
const clearCompletedFiles = () => {
  emit('clearCompleted')
}

// 清除所有文件
const clearAllFiles = () => {
  emit('clearAll')
}
</script>

<template>
  <div
    v-if="uploadingFiles.size > 0"
    class="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]"
  >
    <motion.div
      class="bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      :initial="{ opacity: 0, y: 100, scale: 0.9 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :exit="{ opacity: 0, y: 100, scale: 0.9 }"
      :transition="{ duration: 0.4, ease: 'backOut' }"
      layout
    >
      <!-- 头部 -->
      <motion.div
        class="p-4 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer"
        @click="toggleCollapsed"
        :whileHover="{ backgroundColor: 'rgba(0,0,0,0.02)' }"
        :whileTap="{ scale: 0.98 }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- 状态指示器 -->
            <motion.div
              class="w-3 h-3 rounded-full"
              :class="{
                'bg-blue-500': statusColor === 'blue',
                'bg-green-500': statusColor === 'green',
                'bg-red-500': statusColor === 'red',
                'bg-neutral-400': statusColor === 'neutral'
              }"
              :animate="{
                scale: stats.active > 0 ? [1, 1.2, 1] : 1,
                opacity: stats.active > 0 ? [0.7, 1, 0.7] : 1
              }"
              :transition="{
                duration: 2,
                repeat: stats.active > 0 ? Infinity : 0
              }"
            />
            
            <!-- 标题和统计 -->
            <div>
              <h3 class="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                文件上传队列
                <span class="text-neutral-500 dark:text-neutral-400">
                  ({{ stats.total }})
                </span>
              </h3>
              
              <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                <span v-if="stats.active > 0" class="text-blue-600 dark:text-blue-400">
                  {{ stats.active }} 进行中
                </span>
                <span v-if="stats.completed > 0" class="text-green-600 dark:text-green-400">
                  {{ stats.completed }} 完成
                </span>
                <span v-if="stats.error > 0" class="text-red-600 dark:text-red-400">
                  {{ stats.error }} 失败
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- 整体进度 -->
            <div
              v-if="stats.active > 0"
              class="text-xs text-neutral-500 dark:text-neutral-400 font-mono"
            >
              {{ overallProgress }}%
            </div>
            
            <!-- 折叠图标 -->
            <motion.div
              :animate="{ rotate: isCollapsed ? 0 : 180 }"
              :transition="{ duration: 0.3 }"
            >
              <Icon
                name="tabler:chevron-down"
                class="w-4 h-4 text-neutral-500 dark:text-neutral-400"
              />
            </motion.div>
          </div>
        </div>

        <!-- 整体进度条 -->
        <motion.div
          v-if="stats.active > 0"
          class="mt-3"
          :initial="{ opacity: 0, scaleX: 0 }"
          :animate="{ opacity: 1, scaleX: 1 }"
          :exit="{ opacity: 0, scaleX: 0 }"
          :transition="{ duration: 0.3 }"
          style="transform-origin: left"
        >
          <UProgress
            :model-value="overallProgress"
            :color="statusColor"
            class="h-1.5"
          />
        </motion.div>
      </motion.div>

      <!-- 文件列表 -->
      <AnimatePresence>
        <motion.div
          v-if="!isCollapsed"
          :initial="{ height: 0, opacity: 0 }"
          :animate="{ height: 'auto', opacity: 1 }"
          :exit="{ height: 0, opacity: 0 }"
          :transition="{ duration: 0.3, ease: 'easeInOut' }"
          class="max-h-96 overflow-y-auto"
        >
          <div class="p-2 space-y-2">
            <AnimatePresence mode="popLayout">
              <UploadAnimationCard
                v-for="[fileId, uploadingFile] in uploadingFiles"
                :key="fileId"
                :uploading-file="uploadingFile"
                :file-id="fileId"
                @remove-file="emit('removeFile', $event)"
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      <!-- 底部操作栏 -->
      <AnimatePresence>
        <motion.div
          v-if="!isCollapsed && (stats.completed > 0 || stats.error > 0)"
          :initial="{ opacity: 0, height: 0 }"
          :animate="{ opacity: 1, height: 'auto' }"
          :exit="{ opacity: 0, height: 0 }"
          :transition="{ duration: 0.3 }"
          class="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ stats.completed }} 完成, {{ stats.error }} 失败
            </div>
            
            <div class="flex items-center gap-2">
              <UButton
                v-if="stats.completed > 0"
                size="xs"
                variant="ghost"
                color="neutral"
                @click="clearCompletedFiles"
              >
                清除已完成
              </UButton>
              
              <UButton
                size="xs"
                variant="ghost"
                color="red"
                @click="clearAllFiles"
              >
                清除全部
              </UButton>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  </div>
</template>

<style scoped>
/* 滚动条样式 */
.max-h-96::-webkit-scrollbar {
  width: 4px;
}

.max-h-96::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dark .max-h-96::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>
