<script lang="ts" setup>
import { motion, AnimatePresence } from 'motion-v'
import { computed } from 'vue'

interface UploadStats {
  total: number
  uploading: number
  processing: number
  completed: number
  error: number
  active: number
  overallProgress: number
}

const props = defineProps<{
  stats: UploadStats
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  showDetails: []
}>()

// 计算显示文本
const statusText = computed(() => {
  if (props.stats.active === 0) {
    return props.stats.error > 0 ? '上传完成（有错误）' : '上传完成'
  }
  return `${props.stats.active} 个文件正在处理`
})

// 计算状态颜色
const statusColor = computed(() => {
  if (props.stats.error > 0 && props.stats.active === 0) return 'red'
  if (props.stats.active > 0) return 'blue'
  return 'green'
})

// 计算图标
const statusIcon = computed(() => {
  if (props.stats.active > 0) return 'tabler:upload'
  if (props.stats.error > 0) return 'tabler:alert-circle'
  return 'tabler:check-circle'
})
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="visible"
      class="fixed top-4 right-4 z-50 max-w-sm"
      :initial="{ opacity: 0, x: 100, scale: 0.9 }"
      :animate="{ opacity: 1, x: 0, scale: 1 }"
      :exit="{ opacity: 0, x: 100, scale: 0.9 }"
      :transition="{ duration: 0.3, ease: 'backOut' }"
    >
      <motion.div
        class="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 cursor-pointer"
        :whileHover="{ scale: 1.02 }"
        :whileTap="{ scale: 0.98 }"
        @click="emit('showDetails')"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <motion.div
              :animate="{
                rotate: stats.active > 0 ? 360 : 0
              }"
              :transition="{
                duration: stats.active > 0 ? 2 : 0.3,
                repeat: stats.active > 0 ? Infinity : 0,
                ease: 'linear'
              }"
            >
              <Icon
                :name="statusIcon"
                class="w-5 h-5"
                :class="{
                  'text-blue-600 dark:text-blue-400': statusColor === 'blue',
                  'text-green-600 dark:text-green-400': statusColor === 'green',
                  'text-red-600 dark:text-red-400': statusColor === 'red'
                }"
              />
            </motion.div>
            
            <span class="font-medium text-sm text-neutral-900 dark:text-neutral-100">
              {{ statusText }}
            </span>
          </div>

          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="tabler:x"
            @click.stop="emit('close')"
          />
        </div>

        <!-- 进度信息 -->
        <div class="space-y-2">
          <!-- 整体进度条 -->
          <motion.div
            v-if="stats.active > 0"
            :initial="{ scaleX: 0 }"
            :animate="{ scaleX: 1 }"
            :transition="{ duration: 0.5 }"
            style="transform-origin: left"
          >
            <div class="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              <span>整体进度</span>
              <span>{{ stats.overallProgress }}%</span>
            </div>
            <UProgress
              :model-value="stats.overallProgress"
              :color="statusColor"
              class="h-1.5"
            />
          </motion.div>

          <!-- 统计信息 -->
          <div class="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <div v-if="stats.uploading > 0" class="flex items-center gap-1">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>{{ stats.uploading }} 上传中</span>
            </div>
            
            <div v-if="stats.processing > 0" class="flex items-center gap-1">
              <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>{{ stats.processing }} 处理中</span>
            </div>
            
            <div v-if="stats.completed > 0" class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded-full" />
              <span>{{ stats.completed }} 完成</span>
            </div>
            
            <div v-if="stats.error > 0" class="flex items-center gap-1">
              <div class="w-2 h-2 bg-red-500 rounded-full" />
              <span>{{ stats.error }} 失败</span>
            </div>
          </div>
        </div>

        <!-- 点击提示 -->
        <div class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          点击查看详情
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
</template>

<style scoped></style>
