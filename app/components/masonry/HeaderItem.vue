<script lang="ts" setup>
import avatarImage from '~/assets/images/avatar.webp'

defineProps<{
  stats?: {
    total: number
    dateRange: {
      start: string | undefined
      end: string | undefined
    } | null
  }
  dateRangeText?: string
}>()

const handleOpenLogin = () => {
  window.location.href = '/api/auth/github'
  console.log('Login button clicked')
}

// 获取筛选状态
const { hasActiveFilters, selectedCounts } = usePhotoFilters()

// 获取排序状态
const {
  currentSortLabel,
  currentSortIcon,
  currentSortOption,
  availableSorts,
  setSortOption,
} = usePhotoSort()

// 计算总的筛选项数量
const totalSelectedFilters = computed(() => {
  return Object.values(selectedCounts.value).reduce(
    (total, count) => total + count,
    0,
  )
})
</script>

<template>
  <div
    class="inline-block w-full align-top break-inside-avoid mb-[4px] relative overflow-hidden"
  >
    <div
      class="absolute inset-0 -z-10 blur-3xl scale-110 bg-cover bg-center opacity-35"
      :style="{
        backgroundImage: `url(${avatarImage})`,
      }"
    ></div>
    <div
      class="absolute inset-0 -z-10 bg-white/50 dark:bg-neutral-900/50"
    ></div>
    <div class="flex flex-col items-center py-6 pb-3 gap-2">
      <AuthState>
        <template #default="{ loggedIn, clear }">
          <div class="flex flex-col items-center gap-2">
            <div class="relative mx-auto">
              <div
                v-if="loggedIn"
                class="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white rounded-full flex items-center justify-center size-5 text-xs drop-shadow-lg drop-shadow-amber-500/30"
              >
                <Icon name="tabler:star-filled" />
              </div>
              <img
                :src="avatarImage"
                class="size-12 rounded-full object-cover"
                :class="!loggedIn && 'cursor-pointer'"
                alt="Timothy's Avatar"
                @click="!loggedIn && handleOpenLogin()"
              />
            </div>
            <h1
              class="text-2xl font-bold text-neutral-900 dark:text-white/90 mb-2"
            >
              TimoYin's mems
            </h1>
          </div>
          <div
            class="text-neutral-600 dark:text-white/30 space-y-1 text-center"
          >
            <p class="text-xs font-medium">
              <span v-if="dateRangeText">{{ dateRangeText }}, 共</span>
              {{ stats?.total }} 张照片
            </p>
            <p class="font-[Pacifico]">Mems rest within the lens.</p>
          </div>
          <div
            class="flex items-center gap-0 p-1 bg-white/30 dark:bg-neutral-900/50 rounded-full"
          >
            <UTooltip text="探索地图">
              <UButton
                variant="soft"
                color="neutral"
                class="bg-transparent rounded-full cursor-pointer"
                icon="tabler:map-pin-2"
                size="sm"
                to="/explore"
              />
            </UTooltip>
            <UPopover>
              <UTooltip text="筛选照片">
                <UChip
                  inset
                  size="sm"
                  color="info"
                  :show="totalSelectedFilters > 0"
                >
                  <UButton
                    variant="soft"
                    :color="hasActiveFilters ? 'info' : 'neutral'"
                    class="bg-transparent rounded-full cursor-pointer relative"
                    icon="tabler:filter"
                    size="sm"
                  />
                </UChip>
              </UTooltip>

              <template #content>
                <UCard variant="glassmorphism">
                  <OverlayFilterPanel />
                </UCard>
              </template>
            </UPopover>
            <UPopover>
              <UTooltip text="照片排序">
                <UButton
                  variant="soft"
                  :color="
                    currentSortOption?.key === 'dateTaken-desc'
                      ? 'neutral'
                      : 'info'
                  "
                  class="bg-transparent rounded-full cursor-pointer"
                  :icon="currentSortIcon"
                  size="sm"
                />
              </UTooltip>

              <template #content>
                <UCard
                  variant="glassmorphism"
                  class="w-3xs"
                >
                  <template #header>
                    <h3 class="font-bold text-sm p-1">排序方式</h3>
                  </template>

                  <div class="space-y-1">
                    <UButton
                      v-for="sort in availableSorts"
                      :key="sort.key"
                      :variant="
                        currentSortLabel === sort.label ? 'soft' : 'ghost'
                      "
                      :color="
                        currentSortLabel === sort.label ? 'info' : 'neutral'
                      "
                      :icon="sort.icon"
                      size="sm"
                      block
                      class="justify-start"
                      @click="setSortOption(sort.key)"
                    >
                      {{ sort.label }}
                    </UButton>
                  </div>
                </UCard>
              </template>
            </UPopover>
            <UTooltip
              v-if="loggedIn"
              text="仪表盘"
            >
              <UButton
                size="sm"
                color="info"
                variant="soft"
                class="bg-transparent rounded-full cursor-pointer"
                icon="tabler:dashboard"
                to="/dashboard"
              />
            </UTooltip>
            <UTooltip
              v-if="loggedIn"
              text="登出"
            >
              <UButton
                size="sm"
                color="error"
                variant="soft"
                class="bg-transparent rounded-full cursor-pointer"
                icon="tabler:logout"
                @click="clear"
            /></UTooltip>
          </div>
        </template>
      </AuthState>
    </div>
  </div>
</template>

<style scoped></style>
