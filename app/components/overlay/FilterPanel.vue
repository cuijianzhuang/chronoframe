<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'

const {
  availableFilters,
  selectedCounts,
  toggleFilter,
  isFilterSelected,
  clearAllFilters,
  hasActiveFilters,
} = usePhotoFilters()

const currentTab = ref('labels')

const tabItems = computed<TabsItem[]>(() => [
  {
    label: '标签',
    value: 'labels',
    badge: selectedCounts.value.tags || undefined,
    icon: 'tabler:tags',
    slot: 'tags',
  },
  {
    label: '相机',
    value: 'cameras',
    badge: selectedCounts.value.cameras || undefined,
    icon: 'tabler:camera',
    slot: 'cameras',
  },
  {
    label: '镜头',
    value: 'lenses',
    badge: selectedCounts.value.lenses || undefined,
    icon: 'tabler:aperture',
    slot: 'lenses',
  },
  {
    label: '城市',
    value: 'cities',
    badge: selectedCounts.value.cities || undefined,
    icon: 'tabler:map-pin',
    slot: 'cities',
  },
  {
    label: '评分',
    value: 'ratings',
    badge: selectedCounts.value.ratings || undefined,
    icon: 'tabler:star',
    slot: 'ratings',
  },
])

const handleToggleFilter = (type: string, value: string | number) => {
  toggleFilter(type as any, value)
}
</script>

<template>
  <div class="space-y-3 w-[calc(100vw-34px)] sm:w-96">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-neutral-900 dark:text-white p-2 pb-0">
        筛选照片
      </h3>
      <UButton
        v-if="hasActiveFilters"
        size="sm"
        variant="ghost"
        color="neutral"
        icon="tabler:filter-x"
        @click="clearAllFilters"
      >
        清除全部
      </UButton>
    </div>
    <!-- 标签页 -->
    <UTabs
      v-model="currentTab"
      color="neutral"
      size="xs"
      :items="tabItems"
      :ui="{
        list: 'bg-white/30 dark:bg-neutral-800/50',
        indicator: 'bg-white/80',
        trigger:
          'data-[state=inactive]:text-muted data-[state=active]:text-default dark:data-[state=active]:text-inverted',
        trailingBadge:
          'ring-0 rounded-full py-0 bg-info-100/80 dark:bg-info-900/80 text-info-500 dark:text-info-400 border border-info-300/50 dark:border-info-700/50',
        trailingBadgeSize: 'sm',
      }"
    >
      <!-- 标签面板 -->
      <template #tags>
        <div class="space-y-0.5 max-h-64 overflow-y-auto">
          <div
            v-for="tag in availableFilters.tags"
            :key="tag.label"
            class="flex items-center justify-between cursor-pointer select-none hover:bg-neutral-400/30 dark:hover:bg-info-800/30 rounded-lg px-2 py-2"
            :class="
              isFilterSelected('tags', tag.label)
                ? 'bg-neutral-400/30 dark:bg-info-800/30'
                : ''
            "
            @click="handleToggleFilter('tags', tag.label)"
          >
            <span class="text-sm text-default font-medium truncate">
              {{ tag.label }}
            </span>
            <Icon
              v-if="isFilterSelected('tags', tag.label)"
              name="tabler:check"
              class="size-4 text-green-500"
            />
          </div>
          <div
            v-if="availableFilters.tags.length === 0"
            class="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4"
          >
            没有标签
          </div>
        </div>
      </template>

      <!-- 相机面板 -->
      <template #cameras>
        <div class="space-y-0.5 max-h-64 overflow-y-auto">
          <div
            v-for="camera in availableFilters.cameras"
            :key="camera.label"
            class="flex items-center justify-between cursor-pointer select-none hover:bg-neutral-400/30 dark:hover:bg-info-800/30 rounded-lg px-2 py-2"
            :class="
              isFilterSelected('cameras', camera.label)
                ? 'bg-neutral-400/30 dark:bg-info-800/30'
                : ''
            "
            @click="handleToggleFilter('cameras', camera.label)"
          >
            <span class="text-sm text-default font-medium truncate">
              {{ camera.label }}
            </span>
            <Icon
              v-if="isFilterSelected('cameras', camera.label)"
              name="tabler:check"
              class="size-4 text-green-500"
            />
          </div>
          <div
            v-if="availableFilters.cameras.length === 0"
            class="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4"
          >
            没有相机信息
          </div>
        </div>
      </template>

      <!-- 镜头面板 -->
      <template #lenses>
        <div class="space-y-0.5 max-h-64 overflow-y-auto">
          <div
            v-for="lens in availableFilters.lenses"
            :key="lens.label"
            class="flex items-center justify-between cursor-pointer select-none hover:bg-neutral-400/30 dark:hover:bg-info-800/30 rounded-lg px-2 py-2"
            :class="
              isFilterSelected('lenses', lens.label)
                ? 'bg-neutral-400/30 dark:bg-info-800/30'
                : ''
            "
            @click="handleToggleFilter('lenses', lens.label)"
          >
            <span class="text-sm text-default font-medium truncate">
              {{ lens.label }}
            </span>
            <Icon
              v-if="isFilterSelected('lenses', lens.label)"
              name="tabler:check"
              class="size-4 text-green-500"
            />
          </div>
          <div
            v-if="availableFilters.lenses.length === 0"
            class="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4"
          >
            没有镜头信息
          </div>
        </div>
      </template>

      <!-- 城市面板 -->
      <template #cities>
        <div class="space-y-0.5 max-h-64 overflow-y-auto">
          <div
            v-for="city in availableFilters.cities"
            :key="city.label"
            class="flex items-center justify-between cursor-pointer select-none hover:bg-neutral-400/30 dark:hover:bg-info-800/30 rounded-lg px-2 py-2"
            :class="
              isFilterSelected('cities', city.label)
                ? 'bg-neutral-400/30 dark:bg-info-800/30'
                : ''
            "
            @click="handleToggleFilter('cities', city.label)"
          >
            <span class="text-sm text-default font-medium truncate">
              {{ city.label }}
            </span>
            <Icon
              v-if="isFilterSelected('cities', city.label)"
              name="tabler:check"
              class="size-4 text-green-500"
            />
          </div>
          <div
            v-if="availableFilters.cities.length === 0"
            class="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4"
          >
            没有城市信息
          </div>
        </div>
      </template>

      <!-- 评分面板 -->
      <template #ratings>
        <div class="space-y-0.5 max-h-64 overflow-y-auto">
          <div
            v-for="rating in availableFilters.ratings"
            :key="rating.label"
            class="flex items-center justify-between cursor-pointer select-none hover:bg-neutral-400/30 dark:hover:bg-info-800/30 rounded-lg px-2 py-2"
            :class="
              isFilterSelected('ratings', rating.label)
                ? 'bg-neutral-400/30 dark:bg-info-800/30'
                : ''
            "
            @click="handleToggleFilter('ratings', rating.label)"
          >
            <span class="text-sm text-default font-medium truncate">
              {{ rating.label }} 星
            </span>
            <Icon
              v-if="isFilterSelected('ratings', rating.label)"
              name="tabler:check"
              class="size-4 text-green-500"
            />
          </div>
          <div
            v-if="availableFilters.ratings.length === 0"
            class="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4"
          >
            暂无评分信息
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<style scoped></style>
