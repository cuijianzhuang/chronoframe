<script setup lang="ts">
interface Props {
  photo: Photo
  index: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'visibility-change': [
    { index: number; isVisible: boolean; date: string | Date },
  ]
  openViewer: [number]
}>()

// Constants
const ITEM_GAP = 4

// Reactive state
const isLoading = ref(true)
const actualHeight = ref(0)
const photoRef = ref<HTMLElement>()
const mainImageRef = ref<HTMLImageElement>()
const isVisible = ref(false)
const containerWidth = ref(0)

// Observers
const resizeObserverRef = ref<ResizeObserver | null>(null)
const intersectionObserverRef = ref<IntersectionObserver | null>(null)

// Computed
const containerHeight = computed(() => {
  // Get the actual container width to calculate proper aspect ratio
  const currentWidth = containerWidth.value || 280
  
  // Use actual dimensions from photo data if available
  if (props.photo.width && props.photo.height) {
    const aspectRatio = props.photo.height / props.photo.width
    return Math.round(currentWidth * aspectRatio)
  }

  // Fallback to calculated height if image has loaded
  if (actualHeight.value > 0) {
    return actualHeight.value
  }

  // Default fallback height based on current width
  return Math.round(currentWidth * 1.2) // 1.2 is a reasonable default aspect ratio
})

// Methods
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  isLoading.value = false

  // Update actual height based on loaded image dimensions
  if (img.naturalWidth && img.naturalHeight) {
    const aspectRatio = img.naturalHeight / img.naturalWidth
    const currentWidth = containerWidth.value || 280
    actualHeight.value = Math.round(currentWidth * aspectRatio)
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
      enumerable: true,
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
  // Get container width
  nextTick(() => {
    if (photoRef.value) {
      containerWidth.value = photoRef.value.offsetWidth
      
      // Set up resize observer to track width changes
      const resizeObserver = new ResizeObserver(() => {
        if (photoRef.value) {
          containerWidth.value = photoRef.value.offsetWidth
        }
      })
      resizeObserver.observe(photoRef.value)
      resizeObserverRef.value = resizeObserver
    }
  })

  // Preload thumbnail image
  if (props.photo.thumbnailUrl) {
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalHeight / img.naturalWidth
        const currentWidth = containerWidth.value || 280
        actualHeight.value = Math.round(
          currentWidth * (props.photo.aspectRatio || aspectRatio),
        )
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
      intersectionObserverRef.value = observer
    }

    // Check if main image is already loaded from cache
    if (mainImageRef.value) {
      checkImageLoaded(mainImageRef.value)
    }
  })
})

// Cleanup observers on unmount
onUnmounted(() => {
  if (resizeObserverRef.value) {
    resizeObserverRef.value.disconnect()
  }
  if (intersectionObserverRef.value) {
    intersectionObserverRef.value.disconnect()
  }
})
</script>

<template>
  <div
    ref="photoRef"
    class="inline-block w-full align-top break-inside-avoid transition-all duration-300 cursor-pointer select-none"
    :style="{
      marginBottom: `${ITEM_GAP}px`,
    }"
    @click="emit('openViewer', props.index)"
  >
    <div
      class="relative group overflow-hidden transition-all duration-300"
    >
      <!-- Thumbhash 组件占位符 -->
      <div
        v-if="isLoading && photo.thumbnailHash"
        class="w-full absolute inset-0"
        :style="{ aspectRatio: `${photo.width || 1} / ${photo.height || 1}` }"
      >
        <Thumbhash
          :thumbhash="photo.thumbnailHash"
          class="w-full h-full object-cover scale-110"
          :alt="photo.title || 'Photo placeholder'"
        />
      </div>

      <!-- Loading placeholder (fallback when no thumbhash) -->
      <div
        v-if="isLoading && !photo.thumbnailHash"
        class="w-full bg-gray-200 dark:bg-gray-700 animate-pulse"
        :style="{ aspectRatio: `${photo.width || 1} / ${photo.height || 1.2}` }"
      />

      <!-- Main image -->
      <img
        ref="mainImageRef"
        v-show="!isLoading"
        :src="photo.thumbnailUrl || ''"
        :alt="photo.title || photo.description || 'Photo'"
        class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 block"
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
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
      >
        <div class="text-white flex flex-col gap-1">
          <div class="flex flex-col">
            <p
              v-if="photo.title"
              class="text-base font-medium text-ellipsis line-clamp-1"
            >
              {{ photo.title }}
            </p>
            <p
              v-if="photo.description"
              class="text-xs opacity-80"
            >
              {{ photo.description }}
            </p>
            <p
              v-if="photo.dateTaken"
              class="text-xs opacity-80"
            >
              {{ formatDate(photo.dateTaken) }}
            </p>
          </div>
          <div
            v-if="photo.tags?.length"
            class="mt-1 flex items-center gap-1"
          >
            <UBadge
              v-for="tag in photo.tags"
              :key="tag"
              size="sm"
              color="neutral"
              class="bg-white/20 text-white/80 backdrop-blur-3xl"
            >
              {{ tag }}
            </UBadge>
          </div>
          <div>
            <!-- Camera info from EXIF if available -->
            <div
              v-if="photo.exif && (photo.exif.Make || photo.exif.Model)"
              class="text-sm opacity-70 mt-1 flex items-center gap-1"
            >
              <Icon name="tabler:camera" />
              <span class="text-xs font-medium text-ellipsis line-clamp-1">
                {{
                  [photo.exif.Make, photo.exif.Model].filter(Boolean).join(' ')
                }}
              </span>
            </div>
            <!-- Photo specs from EXIF -->
            <div
              v-if="
                photo.exif &&
                (photo.exif.FNumber ||
                  photo.exif.ExposureTime ||
                  photo.exif.ISO)
              "
              class="text-sm opacity-70 mt-1 flex gap-2"
            >
              <div
                v-if="photo.exif.FocalLength"
                class="flex items-center gap-1"
              >
                <Icon
                  name="streamline:image-accessories-lenses-photos-camera-shutter-picture-photography-pictures-photo-lens"
                />
                <span class="text-xs font-medium">{{
                  photo.exif.FocalLengthIn35mmFormat
                }}</span>
              </div>
              <div
                v-if="photo.exif.FNumber"
                class="flex items-center gap-1"
              >
                <Icon name="tabler:aperture" />
                <span class="text-xs font-medium"
                  >f/{{ photo.exif.FNumber }}</span
                >
              </div>
              <div
                v-if="photo.exif.ExposureTime"
                class="flex items-center gap-1"
              >
                <Icon name="material-symbols:shutter-speed" />
                <span class="text-xs font-medium">
                  {{ formatExposureTime(photo.exif.ExposureTime) }}
                </span>
              </div>
              <div
                v-if="photo.exif.ISO"
                class="flex items-center gap-0.5"
              >
                <Icon name="carbon:iso-outline" />
                <span class="text-xs font-medium">{{ photo.exif.ISO }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
