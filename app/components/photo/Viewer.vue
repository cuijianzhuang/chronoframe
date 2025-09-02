<script setup lang="ts">
import { motion, AnimatePresence } from 'motion-v'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Keyboard, Virtual } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'

import LoadingIndicator from './LoadingIndicator.vue'
import ProgressiveImage from './ProgressiveImage.vue'
import GalleryThumbnail from './GalleryThumbnail.vue'
import InfoPanel from './InfoPanel.vue'
import type { LoadingIndicatorRef } from './LoadingIndicator.vue'

interface Props {
  photos: Photo[]
  currentIndex: number
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  indexChange: [index: number]
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const swiperRef = ref<SwiperType>()
const loadingIndicatorRef = ref<LoadingIndicatorRef>()

// State
const isImageZoomed = ref(false)
const showExifPanel = ref(false)
const currentBlobSrc = ref<string | null>(null)
const zoomLevel = ref(0)
const showZoomLevel = ref(false)
const zoomLevelTimer = ref<NodeJS.Timeout | null>(null)

// Computed
const currentPhoto = computed(() => props.photos[props.currentIndex])
const isMobile = useMediaQuery('(max-width: 768px)')

// 当 PhotoViewer 关闭时重置状态
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      isImageZoomed.value = false
      showExifPanel.value = false
      currentBlobSrc.value = null
      zoomLevel.value = 0
      showZoomLevel.value = false
      if (zoomLevelTimer.value) {
        clearTimeout(zoomLevelTimer.value)
        zoomLevelTimer.value = null
      }
      // TODO: 实现自定义的 ScrollArea 后移除
      document.body.style.overflow = ''
    } else {
      document.body.style.overflow = 'hidden'
    }

    if (isOpen && currentPhoto.value) {
      useHead({
        title: currentPhoto.value.title,
      })
    } else {
      useHead({
        title: 'Gallery',
      })
    }
  },
  { immediate: true },
)

// 同步 Swiper 的索引
watch(
  () => props.currentIndex,
  (newIndex) => {
    if (swiperRef.value && swiperRef.value.activeIndex !== newIndex) {
      swiperRef.value.slideTo(newIndex, 300)
    }
    // 切换图片时重置缩放状态
    isImageZoomed.value = false
    zoomLevel.value = 0
  },
)

// 当图片缩放状态改变时，控制 Swiper 的触摸行为
watch(isImageZoomed, (isZoomed) => {
  if (swiperRef.value) {
    swiperRef.value.allowTouchMove = !isZoomed
  }
})

// Navigation methods
const handlePrevious = () => {
  if (props.currentIndex > 0) {
    emit('indexChange', props.currentIndex - 1)
    swiperRef.value?.slidePrev()
  }
}

const handleNext = () => {
  if (props.currentIndex < props.photos.length - 1) {
    emit('indexChange', props.currentIndex + 1)
    swiperRef.value?.slideNext()
  }
}

// Handle Swiper events
const handleSwiperInit = (swiper: SwiperType) => {
  swiperRef.value = swiper
  swiper.allowTouchMove = !isImageZoomed.value
}

const handleSlideChange = (swiper: SwiperType) => {
  emit('indexChange', swiper.activeIndex)
}

// Handle image events
const handleZoomChange = (isZoomed: boolean, level?: number) => {
  isImageZoomed.value = isZoomed
  if (level !== undefined) {
    zoomLevel.value = level
    // 缩放变化时显示缩放倍率 2 秒
    showZoomLevel.value = true
    if (zoomLevelTimer.value) {
      clearTimeout(zoomLevelTimer.value)
    }
    zoomLevelTimer.value = setTimeout(() => {
      showZoomLevel.value = false
      zoomLevelTimer.value = null
    }, 2000)
  }
}

const handleBlobSrcChange = (blobSrc: string | null) => {
  currentBlobSrc.value = blobSrc
}

const handleImageLoaded = () => {
  // 图片加载完成时显示缩放倍率 2 秒
  showZoomLevel.value = true
  if (zoomLevelTimer.value) {
    clearTimeout(zoomLevelTimer.value)
  }
  zoomLevelTimer.value = setTimeout(() => {
    showZoomLevel.value = false
    zoomLevelTimer.value = null
  }, 2000)
}

defineShortcuts({
  escape: () => {
    emit('close')
  },
})

// 清理定时器
onUnmounted(() => {
  if (zoomLevelTimer.value) {
    clearTimeout(zoomLevelTimer.value)
    zoomLevelTimer.value = null
  }
})

// Swiper modules
const swiperModules = [Navigation, Keyboard, Virtual]
</script>

<template>
  <Teleport to="body">
    <!-- 背景层 -->
    <AnimatePresence>
      <motion.div
        v-if="isOpen"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.3 }"
        class="fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50"
        @click="emit('close')"
      />
    </AnimatePresence>

    <!-- 交叉溶解的 Thumbhash 背景 -->
    <AnimatePresence mode="sync">
      <motion.div
        v-if="isOpen && currentPhoto?.thumbnailHash"
        :key="currentPhoto.id"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.3 }"
        class="fixed inset-0 z-40"
      >
        <Thumbhash
          :thumbhash="currentPhoto.thumbnailHash"
          class="w-full h-full scale-110"
        />
      </motion.div>
    </AnimatePresence>

    <!-- 主内容区域 -->
    <AnimatePresence>
      <motion.div
        v-if="isOpen"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.3 }"
        ref="containerRef"
        class="fixed inset-0 z-50 flex items-center justify-center"
        :style="{ touchAction: isMobile ? 'manipulation' : 'none' }"
        @click.self="emit('close')"
      >
        <div
          class="flex w-full h-full"
          :class="isMobile ? 'flex-col' : 'flex-row'"
        >
          <!-- 图片显示区域 -->
          <div class="z-10 flex min-h-0 min-w-0 flex-1 flex-col">
            <div class="group relative flex min-h-0 min-w-0 flex-1">
              <!-- 顶部工具栏 -->
              <motion.div
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.3 }"
                class="pointer-events-none absolute z-30 flex items-center justify-between"
                :class="
                  isMobile ? 'top-2 right-2 left-2' : 'top-4 right-4 left-4'
                "
              >
                <!-- 左侧工具按钮 -->
                <div class="flex items-center gap-2">
                  <!-- 信息按钮 - 在移动设备上显示 -->
                  <button
                    v-if="isMobile"
                    type="button"
                    class="pointer-events-auto flex size-8 items-center justify-center rounded-full text-white backdrop-blur-xl duration-200"
                    :class="
                      showExifPanel
                        ? 'bg-white/30'
                        : 'bg-black/30 hover:bg-black/40'
                    "
                    @click="showExifPanel = !showExifPanel"
                  >
                    <Icon name="tabler:info-circle" />
                  </button>
                </div>

                <!-- 右侧按钮组 -->
                <div class="flex items-center gap-2">
                  <!-- 关闭按钮 -->
                  <button
                    type="button"
                    class="pointer-events-auto flex size-8 items-center justify-center rounded-full text-white backdrop-blur-xl duration-200 bg-black/30 hover:bg-black/40"
                    @click="emit('close')"
                  >
                    <Icon name="tabler:x" />
                  </button>
                </div>
              </motion.div>

              <!-- 加载指示器 -->
              <LoadingIndicator ref="loadingIndicatorRef" />

              <!-- Swiper 容器 -->
              <Swiper
                :modules="swiperModules"
                :space-between="0"
                :slides-per-view="1"
                :initial-slide="currentIndex"
                :virtual="true"
                :keyboard="{
                  enabled: true,
                  onlyInViewport: true,
                }"
                class="h-full w-full"
                :style="{ touchAction: isMobile ? 'pan-x' : 'pan-y' }"
                @swiper="handleSwiperInit"
                @slide-change="handleSlideChange"
              >
                <SwiperSlide
                  v-for="(photo, index) in photos"
                  :key="photo.id"
                  :virtual-index="index"
                  class="flex items-center justify-center"
                >
                  <motion.div
                    :initial="{ opacity: 0.5, scale: 0.95 }"
                    :animate="{ opacity: 1, scale: 1 }"
                    :exit="{ opacity: 0, scale: 0.95 }"
                    :transition="{ type: 'spring', duration: 0.4, bounce: 0 }"
                    class="relative flex h-full w-full items-center justify-center"
                  >
                    <ProgressiveImage
                      class="h-full w-full object-contain"
                      :loading-indicator-ref="loadingIndicatorRef || null"
                      :is-current-image="index === currentIndex"
                      :src="photo.originalUrl!"
                      :thumbnail-src="photo.thumbnailUrl!"
                      :alt="photo.title || ''"
                      :width="
                        index === currentIndex
                          ? (currentPhoto?.width ?? undefined)
                          : undefined
                      "
                      :height="
                        index === currentIndex
                          ? (currentPhoto?.height ?? undefined)
                          : undefined
                      "
                      :enable-pan="
                        index === currentIndex
                          ? !isMobile || isImageZoomed
                          : true
                      "
                      :enable-zoom="true"
                      :on-zoom-change="
                        index === currentIndex ? handleZoomChange : undefined
                      "
                      :on-blob-src-change="
                        index === currentIndex ? handleBlobSrcChange : undefined
                      "
                      :on-image-loaded="
                        index === currentIndex ? handleImageLoaded : undefined
                      "
                    />

                    <!-- 缩放倍率提示 -->
                    <AnimatePresence>
                      <motion.div
                        v-if="showZoomLevel && zoomLevel > 0"
                        :initial="{ opacity: 0, y: 10 }"
                        :animate="{ opacity: 1, y: 0 }"
                        :exit="{ opacity: 0, y: 10 }"
                        :transition="{ duration: 0.2 }"
                        class="absolute bottom-4 left-4 z-20 bg-black/40 backdrop-blur-3xl rounded-xl border border-white/10 px-4 py-2 shadow-2xl"
                      >
                        <span class="text-white font-medium"
                          >{{ zoomLevel }}x</span
                        >
                      </motion.div>
                    </AnimatePresence>

                    <!-- 操作提示 -->
                    <AnimatePresence>
                      <motion.div
                        v-if="!isImageZoomed"
                        :initial="{ opacity: 0, scale: 0.95 }"
                        :animate="{ opacity: 0.6, scale: 1 }"
                        :exit="{ opacity: 0, scale: 0.95 }"
                        :transition="{ duration: 0.2 }"
                        class="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 bg-black/50 rounded-lg border border-white/10 px-2 py-1 shadow-2xl text-white text-xs font-bold"
                      >
                        {{
                          isMobile ? '双击或捏合缩放' : '双击或用鼠标滚轮缩放'
                        }}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </SwiperSlide>
              </Swiper>

              <!-- 自定义导航按钮 (桌面端) -->
              <template v-if="!isMobile">
                <button
                  v-if="currentIndex > 0"
                  type="button"
                  class="absolute top-1/2 left-4 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 backdrop-blur-sm duration-200 group-hover:opacity-100 bg-black/30 hover:bg-black/40"
                  @click="handlePrevious"
                >
                  <Icon
                    name="tabler:chevron-left"
                    class="text-xl"
                  />
                </button>

                <button
                  v-if="currentIndex < photos.length - 1"
                  type="button"
                  class="absolute top-1/2 right-4 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 backdrop-blur-sm duration-200 group-hover:opacity-100 bg-black/30 hover:bg-black/40"
                  @click="handleNext"
                >
                  <Icon
                    name="tabler:chevron-right"
                    class="text-xl"
                  />
                </button>
              </template>
            </div>

            <!-- 缩略图导航 -->
            <Suspense>
              <GalleryThumbnail
                :current-index="currentIndex"
                :photos="photos"
                @index-change="emit('indexChange', $event)"
              />
            </Suspense>
          </div>

          <!-- EXIF 面板 - 在桌面端始终显示，在移动端根据状态显示 -->
          <Suspense>
            <AnimatePresence v-if="isMobile">
              <InfoPanel
                v-if="showExifPanel && currentPhoto"
                :current-photo="currentPhoto"
                :exif-data="currentPhoto?.exif"
                :on-close="() => (showExifPanel = false)"
              />
            </AnimatePresence>
            <InfoPanel
              v-else-if="currentPhoto"
              :current-photo="currentPhoto"
              :exif-data="currentPhoto?.exif"
            />
          </Suspense>
        </div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
/* Swiper 样式调整 */
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
