<script setup lang="ts">
interface Props {
  photos: Photo[]
  columns?: number | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  columns: 'auto',
})

// Constants
const FIRST_SCREEN_ITEMS_COUNT = 30
const COLUMN_GAP = 4
const AUTO_COLUMN_WIDTH = 280

// Reactive state
const masonryContainer = ref<HTMLElement>()
const containerWidth = ref(0)
const hasAnimated = ref(false)
const showFloatingActions = ref(false)
const dateRange = ref<string>()
const visiblePhotos = ref(new Set<number>())

// Composables
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

// Computed
const columnCount = computed(() => {
  if (props.columns === 'auto') {
    if (!containerWidth.value) return 1

    const availableWidth = containerWidth.value - (isMobile.value ? 16 : 32)
    const maxColumns = isMobile.value ? 2 : 6
    const calculatedColumns = Math.floor(
      (availableWidth + COLUMN_GAP) / (AUTO_COLUMN_WIDTH + COLUMN_GAP),
    )

    return Math.min(Math.max(calculatedColumns, 1), maxColumns)
  }

  return props.columns
})

const photoStats = computed(() => {
  const totalPhotos = props.photos.length
  const photosWithDates = props.photos.filter(p => p.dateTaken).length
  const photosWithTitles = props.photos.filter(p => p.title).length
  const photosWithExif = props.photos.filter(p => p.exif).length
  
  // Get date range of all photos
  const allDates = props.photos
    .map(p => p.dateTaken)
    .filter((date): date is string => Boolean(date))
    .map(date => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime())
  
  const dateRange = allDates.length > 0 ? {
    start: allDates[0],
    end: allDates[allDates.length - 1]
  } : null
  
  return {
    total: totalPhotos,
    withDates: photosWithDates,
    withTitles: photosWithTitles,
    withExif: photosWithExif,
    dateRange
  }
})

const dateRangeText = computed(() => {
  const range = photoStats.value.dateRange
  if (!range || !range.start || !range.end) return ''
  return `${range.start.toLocaleDateString('zh-CN')} - ${range.end.toLocaleDateString('zh-CN')}`
})

// Methods
const calculateAnimationDelay = (index: number): number => {
  if (hasAnimated.value || index >= FIRST_SCREEN_ITEMS_COUNT) return 0
  return Math.min(index * 0.05, 0.3)
}

const handleAnimationComplete = () => {
  hasAnimated.value = true
}

const handleVisibilityChange = ({
  index,
  isVisible,
}: {
  index: number
  isVisible: boolean
  date: string | Date
}) => {
  if (isVisible) {
    visiblePhotos.value.add(index)
  } else {
    visiblePhotos.value.delete(index)
  }
  updateDateRange()
}

const updateDateRange = () => {
  if (visiblePhotos.value.size === 0) {
    dateRange.value = undefined
    return
  }

  const visibleDates = Array.from(visiblePhotos.value)
    .map((index) => props.photos[index]?.dateTaken)
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime())

  if (visibleDates.length === 0) {
    dateRange.value = undefined
    return
  }

  const startDate = visibleDates[0]
  const endDate = visibleDates[visibleDates.length - 1]

  if (!startDate || !endDate) {
    dateRange.value = undefined
    return
  }

  // Format date range with better logic
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
  }

  const formatOptionsWithDay: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  // Check if dates are the same day
  if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()
  ) {
    // Same day
    dateRange.value = startDate.toLocaleDateString('zh-CN', formatOptionsWithDay)
  } else if (
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth()
  ) {
    // Same month
    dateRange.value = startDate.toLocaleDateString('zh-CN', formatOptions)
  } else if (startDate.getFullYear() === endDate.getFullYear()) {
    // Same year, different months
    const startMonth = startDate.toLocaleDateString('zh-CN', { month: 'long' })
    const endMonth = endDate.toLocaleDateString('zh-CN', { month: 'long' })
    const year = startDate.getFullYear()
    dateRange.value = `${startMonth} - ${endMonth} ${year}`
  } else {
    // Different years
    const startFormatted = startDate.toLocaleDateString('zh-CN', formatOptions)
    const endFormatted = endDate.toLocaleDateString('zh-CN', formatOptions)
    dateRange.value = `${startFormatted} - ${endFormatted}`
  }
}

const updateContainerWidth = () => {
  if (masonryContainer.value) {
    containerWidth.value = masonryContainer.value.offsetWidth
  }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  showFloatingActions.value = scrollTop > 500
}

// Lifecycle
onMounted(() => {
  updateContainerWidth()

  // Set up resize observer
  const resizeObserver = new ResizeObserver(() => {
    updateContainerWidth()
  })

  if (masonryContainer.value) {
    resizeObserver.observe(masonryContainer.value)
  }

  // Set up scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Cleanup
  onUnmounted(() => {
    resizeObserver.disconnect()
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<template>
  <div class="masonry-container">
    <!-- Date Range Indicator for Desktop -->
    <div
      v-if="!isMobile && dateRange && showFloatingActions"
      class="fixed top-4 left-4 z-50 lg:top-6 lg:left-6"
    >
      <div
        class="flex flex-col gap-1 bg-black/60 backdrop-blur-[70px] rounded-xl border border-white/10 px-4 py-2 shadow-2xl"
      >
        <span class="text-white text-4xl font-black">{{ dateRange }}</span>
        <span class="text-white/60 text-xl font-bold">重庆、新加坡</span>
      </div>
    </div>

    <!-- Floating Action Bar for Desktop -->
    <div
      v-if="!isMobile && showFloatingActions"
      class="fixed top-4 right-4 z-50 lg:top-6 lg:right-6"
    >
      <div
        class="bg-black/60 backdrop-blur-[70px] rounded-xl border border-white/10 p-3 shadow-2xl"
      >
        <div class="flex gap-2">
          <button
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Icon
              name="mdi:grid"
              class="w-5 h-5 text-white"
            />
          </button>
          <button
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Icon
              name="mdi:filter"
              class="w-5 h-5 text-white"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Date Range Indicator -->
    <div
      v-if="isMobile && dateRange && showFloatingActions"
      class="fixed top-0 right-0 left-0 z-50"
    >
      <div
        class="bg-black/60 backdrop-blur-[70px] border-b border-white/10 px-4 py-3"
      >
        <span class="text-white text-sm">{{ dateRange }}</span>
      </div>
    </div>

    <!-- Mobile Floating Action Button -->
    <div
      v-if="isMobile && showFloatingActions"
      class="fixed bottom-6 right-6 z-50"
    >
      <button
        class="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center"
      >
        <Icon
          name="mdi:plus"
          class="w-6 h-6 text-white"
        />
      </button>
    </div>

    <!-- Masonry Container -->
    <div
      class="p-1 lg:px-0 lg:pb-0"
      :style="{ userSelect: 'none' }"
    >
      <!-- Mobile Header -->
      <div
        v-if="isMobile"
        class="mb-4 text-center"
      >
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Photo Gallery
        </h1>
        <AuthState>
          <template #default="{ loggedIn, user, clear }">
            <div
              v-if="loggedIn"
              class="text-gray-600 dark:text-gray-400"
            >
              Logged in as {{ user?.username || user?.email }}
              <button
                @click="clear"
                class="ml-2 text-blue-500"
              >
                Logout
              </button>
            </div>
            <div v-else>
              <a
                href="/api/auth/github"
                class="text-blue-500"
              >
                Login
              </a>
            </div>
          </template>
          <template #placeholder>
            <button disabled>Loading...</button>
          </template>
        </AuthState>
      </div>

      <!-- Masonry Grid -->
      <div
        ref="masonryContainer"
        class="masonry-grid"
        :style="{
          columnCount: columnCount,
          columnGap: `${COLUMN_GAP}px`,
        }"
      >
        <!-- Desktop Header -->
        <div
          v-if="!isMobile"
          class="masonry-item break-inside-avoid mb-4 select-auto"
          :style="{ width: '100%' }"
        >
          <div class="text-center py-8">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Photo Gallery
            </h1>
            <div class="text-gray-600 dark:text-gray-400 space-y-1">
              <p class="text-lg">{{ photoStats.total }} 张照片</p>
              <div class="text-sm space-y-1">
                <p v-if="dateRangeText">
                  时间跨度: {{ dateRangeText }}
                </p>
                <p>{{ photoStats.withDates }} 张包含拍摄时间 · {{ photoStats.withExif }} 张包含 EXIF 数据</p>
              </div>
            </div>
            <AuthState>
              <template #default="{ loggedIn, user, clear }">
                <div
                  v-if="loggedIn"
                  class="text-gray-600 dark:text-gray-400 flex flex-col items-center"
                >
                  Logged in as {{ user?.username || user?.email }}
                  <div class="gap-3">
                    <NuxtLink
                      to="/dashboard"
                      class="ml-2 text-blue-500"
                    >
                      Dashboard
                    </NuxtLink>
                    <button
                      @click="clear"
                      class="ml-2 text-blue-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
                <div v-else>
                  <a
                    href="/api/auth/github"
                    class="text-blue-500"
                  >
                    Login
                  </a>
                </div>
              </template>
              <template #placeholder>
                <button disabled>Loading...</button>
              </template>
            </AuthState>
          </div>
        </div>

        <!-- Photo Items -->
        <MasonryPhotoItem
          v-for="(photo, index) in photos"
          :key="photo.id || index"
          :photo="photo"
          :index="index"
          :has-animated="hasAnimated"
          :should-animate="!hasAnimated && index < FIRST_SCREEN_ITEMS_COUNT"
          :animation-delay="calculateAnimationDelay(index)"
          @animation-complete="handleAnimationComplete"
          @visibility-change="handleVisibilityChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry-container {
  position: relative;
  width: 100%;
}

.masonry-grid {
  width: 100%;
  column-fill: balance;
}

.masonry-item {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
</style>
