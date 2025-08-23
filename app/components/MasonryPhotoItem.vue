<script setup lang="ts">
interface Photo {
  id?: string
  url: string
  title?: string
  date?: string | Date
}

interface Props {
  photo: Photo
  index: number
  hasAnimated: boolean
  shouldAnimate: boolean
  animationDelay: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'animation-complete': []
  'visibility-change': [
    { index: number; isVisible: boolean; date: string | Date },
  ]
}>()

// Constants
const ITEM_GAP = 2
const ESTIMATED_HEIGHT = 280

// Reactive state
const isLoading = ref(true)
const estimatedHeight = ref(ESTIMATED_HEIGHT)
const photoRef = ref<HTMLElement>()
const isVisible = ref(false)

// Methods
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  isLoading.value = false

  // Update estimated height based on actual image dimensions
  if (img.naturalWidth && img.naturalHeight) {
    const aspectRatio = img.naturalHeight / img.naturalWidth
    estimatedHeight.value = 280 * aspectRatio // Assuming 280px width
  }

  // Trigger animation after image loads
  if (props.shouldAnimate) {
    setTimeout(() => {
      emit('animation-complete')
    }, props.animationDelay * 1000)
  }
}

const handleImageError = () => {
  isLoading.value = false
  console.warn(`Failed to load image: ${props.photo.url}`)
}

const formatDate = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Preload image on mount to get dimensions
onMounted(() => {
  const img = new Image()
  img.onload = () => {
    if (img.naturalWidth && img.naturalHeight) {
      const aspectRatio = img.naturalHeight / img.naturalWidth
      estimatedHeight.value = 280 * aspectRatio
    }
  }
  img.src = props.photo.url

  // Set up intersection observer for visibility tracking
  nextTick(() => {
    if (photoRef.value) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const newVisibility = entry.isIntersecting
            if (newVisibility !== isVisible.value) {
              isVisible.value = newVisibility
              emit('visibility-change', {
                index: props.index,
                isVisible: newVisibility,
                date: props.photo.date || new Date(),
              })
            }
          })
        },
        {
          threshold: 0.1, // Trigger when 10% of the item is visible
          rootMargin: '50px 0px 50px 0px', // Add some margin for smoother transitions
        },
      )

      observer.observe(photoRef.value)

      // Cleanup observer on unmount
      onUnmounted(() => {
        observer.disconnect()
      })
    }
  })
})
</script>

<template>
  <div
    ref="photoRef"
    class="masonry-item break-inside-avoid transition-all duration-300"
    :style="{
      marginBottom: `${ITEM_GAP}px`,
      opacity: shouldAnimate ? (hasAnimated ? 1 : 0) : 1,
      transform: shouldAnimate
        ? hasAnimated
          ? 'translateY(0) scale(1)'
          : 'translateY(30px) scale(0.95)'
        : 'none',
    }"
  >
    <div
      class="relative group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <!-- Loading placeholder -->
      <div
        v-if="isLoading"
        class="w-full bg-gray-200 dark:bg-gray-700 animate-pulse"
        :style="{ height: `${estimatedHeight}px` }"
      />

      <!-- Image -->
      <img
        v-show="!isLoading"
        :src="photo.url"
        :alt="`Photo ${index + 1}`"
        class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        @load="handleImageLoad"
        @error="handleImageError"
        loading="lazy"
      />

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"
      />

      <!-- Photo info overlay (bottom) -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
      >
        <div class="text-white">
          <p
            class="text-sm font-medium"
            v-if="photo.title"
          >
            {{ photo.title }}
          </p>
          <p
            class="text-xs opacity-80"
            v-if="photo.date"
          >
            {{ formatDate(photo.date) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry-item {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
</style>
