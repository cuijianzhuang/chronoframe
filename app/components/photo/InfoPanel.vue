<script setup lang="ts">
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import type { NeededExif } from '../../../shared/types/photo'
import { useMediaQuery } from '~/composables/useMediaQuery'

interface Props {
  currentPhoto: Photo
  exifData?: NeededExif | null
  onClose?: () => void
}

const props = defineProps<Props>()

// 格式化曝光时间
const formatExposureTime = (
  exposureTime: string | number | undefined,
): string => {
  if (!exposureTime) return ''

  let seconds: number

  if (typeof exposureTime === 'string') {
    if (exposureTime.includes('/')) {
      const parts = exposureTime.split('/')
      if (parts.length === 2 && parts[0] && parts[1]) {
        const numerator = parseFloat(parts[0])
        const denominator = parseFloat(parts[1])
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          seconds = numerator / denominator
        } else {
          return exposureTime
        }
      } else {
        return exposureTime
      }
    } else {
      seconds = parseFloat(exposureTime)
      if (isNaN(seconds)) {
        return exposureTime
      }
    }
  } else {
    seconds = exposureTime
  }

  if (seconds >= 1) {
    return `${seconds}s`
  } else {
    const denominator = Math.round(1 / seconds)
    return `1/${denominator}`
  }
}

// 格式化日期
const formatDate = (date: string | undefined): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 格式化文件大小
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)} MB`
}

// EXIF 数据项
const exifItems = computed(() => {
  if (!props.exifData) return []

  const items = []

  // 基本信息
  if (props.currentPhoto.width && props.currentPhoto.height) {
    items.push({
      label: '尺寸',
      value: `${props.currentPhoto.width} × ${props.currentPhoto.height}`,
      icon: 'tabler:dimensions',
    })
  }

  if (props.currentPhoto.fileSize) {
    items.push({
      label: '文件大小',
      value: formatFileSize(props.currentPhoto.fileSize),
      icon: 'tabler:file',
    })
  }

  if (props.currentPhoto.dateTaken) {
    items.push({
      label: '拍摄时间',
      value: formatDate(props.currentPhoto.dateTaken),
      icon: 'tabler:calendar',
    })
  }

  // 相机信息
  if (props.exifData.Make && props.exifData.Model) {
    items.push({
      label: '相机',
      value: `${props.exifData.Make} ${props.exifData.Model}`,
      icon: 'tabler:camera',
    })
  }

  if (props.exifData.LensMake && props.exifData.LensModel) {
    items.push({
      label: '镜头',
      value: `${props.exifData.LensMake} ${props.exifData.LensModel}`,
      icon: 'tabler:focus-2',
    })
  }

  // 拍摄参数
  if (props.exifData.FocalLengthIn35mmFormat) {
    items.push({
      label: '焦距',
      value: `${props.exifData.FocalLengthIn35mmFormat}`,
      icon: 'tabler:zoom-in',
    })
  }

  if (props.exifData.FNumber) {
    items.push({
      label: '光圈',
      value: `f/${props.exifData.FNumber}`,
      icon: 'tabler:aperture',
    })
  }

  if (props.exifData.ExposureTime) {
    items.push({
      label: '快门速度',
      value: formatExposureTime(props.exifData.ExposureTime),
      icon: 'tabler:clock',
    })
  }

  if (props.exifData.ISO) {
    items.push({
      label: 'ISO',
      value: props.exifData.ISO.toString(),
      icon: 'tabler:sun',
    })
  }

  // GPS 信息
  if (props.exifData.GPSLatitude && props.exifData.GPSLongitude) {
    const lat =
      typeof props.exifData.GPSLatitude === 'number'
        ? props.exifData.GPSLatitude
        : parseFloat(props.exifData.GPSLatitude)
    const lng =
      typeof props.exifData.GPSLongitude === 'number'
        ? props.exifData.GPSLongitude
        : parseFloat(props.exifData.GPSLongitude)
    items.push({
      label: 'GPS 坐标',
      value: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      icon: 'tabler:map-pin',
    })
  }

  return items
})

const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<template>
  <motion.div
    :initial="{
      opacity: 0,
      x: isMobile ? 0 : 80,
      y: isMobile ? 20 : 0,
    }"
    :animate="{
      opacity: 1,
      x: 0,
      y: 0,
    }"
    :exit="{
      opacity: 0,
      x: isMobile ? 0 : 80,
      y: isMobile ? 20 : 0,
    }"
    :transition="{ type: 'spring', duration: 0.4, bounce: 0, delay: 0.1 }"
    class="bg-black/30 backdrop-blur-xl border-white/10"
    :class="{
      'fixed inset-x-2 bottom-2 max-h-[60vh] border rounded-xl z-50': isMobile,
      'w-80 border-l': !isMobile,
    }"
  >
    <!-- 移动端头部 -->
    <div
      v-if="isMobile && onClose"
      class="flex items-center justify-between p-4 border-b border-white/10"
    >
      <h3 class="text-lg font-medium text-white">照片信息</h3>
      <button
        type="button"
        class="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        @click="onClose"
      >
        <Icon
          name="tabler:x"
          class="w-5 h-5"
        />
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="p-4 overflow-y-auto max-h-full">
      <!-- 照片标题 -->
      <div
        v-if="currentPhoto.title"
        class="mb-4"
      >
        <h3
          class="text-lg font-medium text-white mb-1 text-ellipsis line-clamp-1"
        >
          {{ currentPhoto.title }}
        </h3>
      </div>

      <!-- 照片描述 -->
      <div
        v-if="currentPhoto.description"
        class="mb-4 text-sm text-white/80"
      >
        {{ currentPhoto.description }}
      </div>

      <!-- EXIF 信息 -->
      <div
        v-if="exifItems.length > 0"
        class="space-y-3"
      >
        <h4 class="text-sm font-medium text-white/90 uppercase tracking-wide">
          照片信息
        </h4>

        <div class="space-y-2">
          <div
            v-for="item in exifItems"
            :key="item.label"
            class="flex items-center gap-3 text-sm"
          >
            <Icon
              :name="item.icon"
              class="w-4 h-4 text-white/60 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="text-white/60">{{ item.label }}</div>
              <div class="text-white font-medium truncate">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div
        v-if="currentPhoto.tags && currentPhoto.tags.length > 0"
        class="mt-4"
      >
        <h4
          class="text-sm font-medium text-white/90 uppercase tracking-wide mb-2"
        >
          标签
        </h4>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in currentPhoto.tags"
            :key="tag"
            class="px-2 py-1 text-xs bg-white/10 text-white rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
</template>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
