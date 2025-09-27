<script lang="ts" setup>
import { motion, AnimatePresence } from 'motion-v'
import { ref, computed } from 'vue'

interface Props {
  isDragOver?: boolean
  isUploading?: boolean
  acceptedTypes?: string
  maxFileSize?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDragOver: false,
  isUploading: false,
  acceptedTypes: 'image/jpeg,image/png,image/heic,image/heif,video/quicktime,.mov',
  maxFileSize: 100,
  disabled: false
})

const emit = defineEmits<{
  filesSelected: [files: FileList]
  dragEnter: []
  dragLeave: []
}>()

const fileInputRef = ref<HTMLInputElement>()
const isDragOverInternal = ref(false)
const dragCounter = ref(0)

// 计算拖拽状态
const isActive = computed(() => props.isDragOver || isDragOverInternal.value)

// 处理拖拽事件
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  dragCounter.value++
  
  if (dragCounter.value === 1) {
    isDragOverInternal.value = true
    emit('dragEnter')
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  dragCounter.value--
  
  if (dragCounter.value === 0) {
    isDragOverInternal.value = false
    emit('dragLeave')
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  dragCounter.value = 0
  isDragOverInternal.value = false
  emit('dragLeave')
  
  if (props.disabled) return
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('filesSelected', files)
  }
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('filesSelected', input.files)
  }
  // 清空输入值以允许重新选择相同文件
  input.value = ''
}

// 触发文件选择
const triggerFileSelect = () => {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}

// 格式化接受的文件类型
const acceptedTypesText = computed(() => {
  return 'JPEG、PNG、HEIC 格式照片，以及 MOV 格式 LivePhoto 视频'
})
</script>

<template>
  <motion.div
    class="relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer overflow-hidden"
    :class="{
      'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30': isActive && !disabled,
      'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500': !isActive && !disabled,
      'border-neutral-200 dark:border-neutral-700 cursor-not-allowed opacity-50': disabled
    }"
    :animate="{
      scale: isActive ? 1.02 : 1,
      borderWidth: isActive ? 3 : 2
    }"
    :transition="{ duration: 0.2, ease: 'easeOut' }"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @click="triggerFileSelect"
  >
    <!-- 背景动画 -->
    <AnimatePresence>
      <motion.div
        v-if="isActive"
        class="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/20 dark:to-purple-600/20"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.3 }"
      />
    </AnimatePresence>

    <!-- 内容区域 -->
    <div class="relative p-8 text-center">
      <!-- 图标区域 -->
      <motion.div
        class="mb-4 flex justify-center"
        :animate="{
          y: isActive ? -8 : 0,
          scale: isActive ? 1.1 : 1
        }"
        :transition="{ duration: 0.3, ease: 'backOut' }"
      >
        <div
          class="p-4 rounded-full"
          :class="{
            'bg-blue-100 dark:bg-blue-900/50': isActive,
            'bg-neutral-100 dark:bg-neutral-800': !isActive
          }"
        >
          <AnimatePresence mode="wait">
            <motion.div
              :key="isUploading ? 'uploading' : isActive ? 'active' : 'idle'"
              :initial="{ opacity: 0, rotate: -90 }"
              :animate="{ opacity: 1, rotate: 0 }"
              :exit="{ opacity: 0, rotate: 90 }"
              :transition="{ duration: 0.3 }"
            >
              <Icon
                v-if="isUploading"
                name="tabler:loader"
                class="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin"
              />
              <Icon
                v-else-if="isActive"
                name="tabler:cloud-upload"
                class="w-8 h-8 text-blue-600 dark:text-blue-400"
              />
              <Icon
                v-else
                name="tabler:photo-plus"
                class="w-8 h-8 text-neutral-500 dark:text-neutral-400"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <!-- 文本区域 -->
      <motion.div
        :animate="{
          y: isActive ? -4 : 0
        }"
        :transition="{ duration: 0.3, ease: 'easeOut' }"
      >
        <AnimatePresence mode="wait">
          <motion.div
            :key="isUploading ? 'uploading' : isActive ? 'active' : 'idle'"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.3 }"
          >
            <h3
              class="text-lg font-semibold mb-2"
              :class="{
                'text-blue-700 dark:text-blue-300': isActive,
                'text-neutral-900 dark:text-neutral-100': !isActive
              }"
            >
              <template v-if="isUploading">
                正在上传文件...
              </template>
              <template v-else-if="isActive">
                松开以上传文件
              </template>
              <template v-else>
                选择照片上传
              </template>
            </h3>
            
            <p
              class="text-sm mb-4"
              :class="{
                'text-blue-600 dark:text-blue-400': isActive,
                'text-neutral-600 dark:text-neutral-400': !isActive
              }"
            >
              <template v-if="isUploading">
                请稍候，文件正在处理中...
              </template>
              <template v-else-if="isActive">
                拖拽文件到此区域即可开始上传
              </template>
              <template v-else>
                点击选择文件或将文件拖拽到此处
              </template>
            </p>
          </motion.div>
        </AnimatePresence>

        <!-- 支持的文件类型 -->
        <motion.div
          class="text-xs text-neutral-500 dark:text-neutral-400"
          :animate="{
            opacity: isActive ? 0.8 : 0.6
          }"
          :transition="{ duration: 0.2 }"
        >
          <p class="mb-1">支持格式: {{ acceptedTypesText }}</p>
          <p>最大文件大小: {{ maxFileSize }}MB</p>
        </motion.div>

        <!-- 上传按钮 -->
        <motion.div
          v-if="!isActive && !isUploading"
          class="mt-4"
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ delay: 0.1, duration: 0.3 }"
        >
          <UButton
            color="primary"
            variant="soft"
            icon="tabler:upload"
            :disabled="disabled"
            @click.stop="triggerFileSelect"
          >
            选择文件
          </UButton>
        </motion.div>
      </motion.div>

      <!-- 浮动粒子效果 -->
      <AnimatePresence>
        <motion.div
          v-if="isActive"
          class="absolute inset-0 pointer-events-none"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="absolute w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full opacity-30"
            :class="`particle-${i}`"
          />
        </motion.div>
      </AnimatePresence>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      :accept="acceptedTypes"
      class="hidden"
      :disabled="disabled"
      @change="handleFileSelect"
    >
  </motion.div>
</template>

<style scoped>
/* 粒子动画 */
.particle-1 {
  top: 20%;
  left: 15%;
  animation: float 3s ease-in-out infinite;
  animation-delay: 0s;
}

.particle-2 {
  top: 30%;
  right: 20%;
  animation: float 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.particle-3 {
  bottom: 30%;
  left: 25%;
  animation: float 3.5s ease-in-out infinite;
  animation-delay: 1s;
}

.particle-4 {
  bottom: 20%;
  right: 15%;
  animation: float 2.8s ease-in-out infinite;
  animation-delay: 1.5s;
}

.particle-5 {
  top: 50%;
  left: 10%;
  animation: float 3.2s ease-in-out infinite;
  animation-delay: 2s;
}

.particle-6 {
  top: 60%;
  right: 25%;
  animation: float 2.3s ease-in-out infinite;
  animation-delay: 2.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.2);
  }
}
</style>
