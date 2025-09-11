<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import {
  calculateHistogramCompressed,
  drawHistogramToCanvas,
  type HistogramDataCompressed,
} from '~/libs/histogram'

const props = defineProps<{
  thumbnailUrl: string
  options?: Parameters<typeof drawHistogramToCanvas>[2]
  class?: string
}>()

const canvasRef = useTemplateRef('canvasRef')
const isLoading = ref(true)
const isError = ref(false)
const histogramData = ref<HistogramDataCompressed | null>(null)

watchEffect(() => {
  isLoading.value = true

  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = props.thumbnailUrl

  img.onerror = () => {
    isError.value = true
    isLoading.value = false
  }

  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      isError.value = true
      isLoading.value = false
      return
    }

    const scale = 360 / Math.max(img.width, img.height)
    const [w, h] = [
      Math.floor(img.width * scale),
      Math.floor(img.height * scale),
    ]
    canvas.width = w
    canvas.height = h
    ctx.drawImage(img, 0, 0, w, h)

    try {
      const imageData = ctx.getImageData(0, 0, w, h)
      histogramData.value = calculateHistogramCompressed(imageData)
    } catch (e) {
      isError.value = true
      console.error('Failed to calculate histogram', e)
    } finally {
      isLoading.value = false
    }
  }
})

watchEffect(() => {
  if (histogramData.value && canvasRef.value) {
    drawHistogramToCanvas(canvasRef.value, histogramData.value, props.options)
  }
})
</script>

<template>
  <div :class="twMerge('relative w-full h-32 group overflow-hidden', $props.class)">
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-neutral-900/10 flex flex-col gap-2 items-center justify-center rounded-lg backdrop-blur-xl z-10 text-white"
      >
        <Icon
          name="tabler:loader"
          class="text-xl animate-spin"
        />
        <span class="text-xs font-medium">Rendering</span>
      </div>
    </Transition>
    <Transition name="fade">
      <div
        v-if="isError"
        class="absolute inset-0 bg-neutral-900/10 flex flex-col gap-2 items-center justify-center rounded-lg backdrop-blur-xl z-10 text-white"
      >
        <Icon
          name="tabler:alert-triangle"
          class="text-xl animate-spin"
        />
        <span class="text-xs font-medium">直方图加载失败</span>
      </div>
    </Transition>
    <canvas
      v-if="histogramData"
      ref="canvasRef"
      class="w-full h-full rounded-lg backdrop-blur-xl"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-150;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>
