<script setup lang="ts">
import Thumbhash from './Thumbhash.vue'

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
const ITEM_GAP = 4
const DEFAULT_WIDTH = 280

// Reactive state
const isLoading = ref(true)
const actualHeight = ref(0)
const photoRef = ref<HTMLElement>()
const mainImageRef = ref<HTMLImageElement>()
const isVisible = ref(false)

// Computed
const containerHeight = computed(() => {
  // Use actual dimensions from photo data if available
  if (props.photo.width && props.photo.height) {
    const aspectRatio = props.photo.height / props.photo.width
    return Math.round(DEFAULT_WIDTH * aspectRatio)
  }

  // Fallback to calculated height if image has loaded
  if (actualHeight.value > 0) {
    return actualHeight.value
  }

  // Default fallback height
  return 280
})

// Methods
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  isLoading.value = false

  // Update actual height based on loaded image dimensions
  if (img.naturalWidth && img.naturalHeight) {
    const aspectRatio = img.naturalHeight / img.naturalWidth
    actualHeight.value = Math.round(DEFAULT_WIDTH * aspectRatio)
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
  console.warn(`Failed to load image: ${props.photo.thumbnailUrl}`)
}

// Check if image is already loaded (cached)
const checkImageLoaded = (img: HTMLImageElement) => {
  if (img.complete && img.naturalHeight !== 0) {
    // Create a synthetic event for consistency
    const syntheticEvent = new Event('load')
    Object.defineProperty(syntheticEvent, 'target', {
      value: img,
      enumerable: true
    })
    handleImageLoad(syntheticEvent)
  }
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

const formatExposureTime = (
  exposureTime: string | number | undefined,
): string => {
  if (!exposureTime) return ''

  let seconds: number

  // Handle different input formats
  if (typeof exposureTime === 'string') {
    // Try to parse fraction format like "1/60"
    if (exposureTime.includes('/')) {
      const parts = exposureTime.split('/')
      if (parts.length === 2 && parts[0] && parts[1]) {
        const numerator = parseFloat(parts[0])
        const denominator = parseFloat(parts[1])
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          seconds = numerator / denominator
        } else {
          return exposureTime // Return original if can't parse
        }
      } else {
        return exposureTime // Return original if format is unexpected
      }
    } else {
      // Try to parse as decimal
      seconds = parseFloat(exposureTime)
      if (isNaN(seconds)) {
        return exposureTime // Return original if can't parse
      }
    }
  } else {
    seconds = exposureTime
  }

  // Convert to fraction format
  if (seconds >= 1) {
    // For exposures 1 second or longer, show as decimal with "s"
    return `${seconds}s`
  } else {
    // For fast exposures, convert to 1/x format
    const denominator = Math.round(1 / seconds)
    return `1/${denominator}`
  }
}

// Preload image on mount to get dimensions
onMounted(() => {
  // Preload thumbnail image
  if (props.photo.thumbnailUrl) {
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalHeight / img.naturalWidth
        actualHeight.value = Math.round(DEFAULT_WIDTH * (props.photo.aspectRatio || aspectRatio))
      }
      // Update loading state after preload completes
      isLoading.value = false
    }
    img.onerror = () => {
      // Even if preload fails, we should stop loading state
      isLoading.value = false
    }
    img.src = props.photo.thumbnailUrl
  } else {
    // If no thumbnail URL, stop loading immediately
    isLoading.value = false
  }

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
                date: props.photo.dateTaken || new Date().toISOString(),
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

    // Check if main image is already loaded from cache
    if (mainImageRef.value) {
      checkImageLoaded(mainImageRef.value)
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
      class="relative group overflow-hidden transition-all duration-300"
      :style="{ height: `${containerHeight}px` }"
    >
      <!-- Thumbhash 组件占位符 -->
      <div
        v-if="isLoading && photo.thumbnailHash"
        class="w-full h-full absolute inset-0"
      >
        <Thumbhash
          :thumbhash="photo.thumbnailHash"
          class="w-full h-full object-cover filter blur-sm"
          :alt="photo.title || 'Photo placeholder'"
        />
      </div>

      <!-- Loading placeholder (fallback when no thumbhash) -->
      <div
        v-if="isLoading && !photo.thumbnailHash"
        class="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse absolute inset-0"
      />

      <!-- Main image -->
      <img
        ref="mainImageRef"
        v-show="!isLoading"
        :src="photo.thumbnailUrl || ''"
        :alt="photo.title || photo.description || 'Photo'"
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
            v-if="photo.title"
            class="text-sm font-medium mb-1"
          >
            {{ photo.title }}
          </p>
          <p
            v-if="photo.description"
            class="text-xs opacity-80 mb-1"
          >
            {{ photo.description }}
          </p>
          <p
            v-if="photo.dateTaken"
            class="text-xs opacity-80"
          >
            {{ formatDate(photo.dateTaken) }}
          </p>
          <!-- Camera info from EXIF if available -->
          <div
            v-if="photo.exif && (photo.exif.Make || photo.exif.Model)"
            class="text-xs opacity-70 mt-1"
          >
            {{ [photo.exif.Make, photo.exif.Model].filter(Boolean).join(' ') }}
          </div>
          <!-- Photo specs from EXIF -->
          <div
            v-if="
              photo.exif &&
              (photo.exif.FNumber || photo.exif.ExposureTime || photo.exif.ISO)
            "
            class="text-xs opacity-70 mt-1 flex gap-2"
          >
            <span v-if="photo.exif.FNumber">f/{{ photo.exif.FNumber }}</span>
            <span v-if="photo.exif.ExposureTime">{{
              formatExposureTime(photo.exif.ExposureTime)
            }}</span>
            <span v-if="photo.exif.ISO">ISO {{ photo.exif.ISO }}</span>
          </div>
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
