<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Locations',
})

interface LocationStats {
  statistics: {
    totalPhotosWithGps: number
    photosWithCity: number
    photosNeedingReindex: number
    coveragePercentage: string
  }
  message: string
}

interface ReindexResult {
  message: string
  processed: number
  updated: number
  errors?: Array<{ photoId: string; error: string }>
  statistics: {
    totalFound: number
    successRate: string
  }
}

const isLoading = ref(false)
const isReindexing = ref(false)
const reindexResult = ref<ReindexResult | null>(null)

const { data: locationStats, refresh: refreshStats } = await useFetch<LocationStats>('/api/photos/reindex-city', {
  server: false,
})

const refreshData = async () => {
  isLoading.value = true
  try {
    await refreshStats()
  } finally {
    isLoading.value = false
  }
}

const startReindex = async (force = false) => {
  if (isReindexing.value) return
  
  isReindexing.value = true
  reindexResult.value = null
  
  try {
    const data = await $fetch<ReindexResult>('/api/photos/reindex-city', {
      method: 'POST',
      body: { force }
    })
    
    reindexResult.value = data
    await refreshStats()
    
    // 显示成功通知
    if (data.updated > 0) {
      useToast().add({
        title: '重新索引完成',
        description: `成功更新了 ${data.updated} 张照片的城市信息`,
        color: 'success'
      })
    } else {
      useToast().add({
        title: '重新索引完成',
        description: '没有照片需要更新',
        color: 'info'
      })
    }
  } catch (error: any) {
    console.error('Reindex failed:', error)
    useToast().add({
      title: '重新索引失败',
      description: error?.message || '未知错误',
      color: 'error'
    })
  } finally {
    isReindexing.value = false
  }
}

// 格式化百分比
const formatPercentage = (value: string) => {
  return `${value}%`
}
</script>

<template>
  <div class="flex flex-col gap-6 h-full p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">位置信息管理</h1>
      <UButton
        icon="i-tabler-refresh"
        variant="outline"
        :loading="isLoading"
        @click="refreshData"
      >
        刷新统计
      </UButton>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 总GPS照片数 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              有GPS坐标的照片
            </p>
            <p class="text-2xl font-bold">{{ locationStats?.statistics.totalPhotosWithGps || 0 }}</p>
          </div>
          <UIcon
            name="i-tabler-map-pin"
            class="w-8 h-8 text-info"
          />
        </div>
      </UCard>

      <!-- 有城市信息的照片 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              已有城市信息
            </p>
            <p class="text-2xl font-bold">{{ locationStats?.statistics.photosWithCity || 0 }}</p>
          </div>
          <UIcon
            name="i-tabler-building"
            class="w-8 h-8 text-success"
          />
        </div>
      </UCard>

      <!-- 需要重新索引的照片 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              需要重新索引
            </p>
            <p class="text-2xl font-bold text-warning-500">{{ locationStats?.statistics.photosNeedingReindex || 0 }}</p>
          </div>
          <UIcon
            name="i-tabler-alert-triangle"
            class="w-8 h-8 text-warning-500"
          />
        </div>
      </UCard>

      <!-- 覆盖率 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              城市信息覆盖率
            </p>
            <p class="text-2xl font-bold">
              {{ formatPercentage(locationStats?.statistics.coveragePercentage || '0') }}
            </p>
          </div>
          <UIcon
            name="i-tabler-percentage"
            class="w-8 h-8 text-primary"
          />
        </div>
      </UCard>
    </div>

    <!-- 操作区域 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">重新索引操作</h2>
      </template>

      <div class="space-y-4">
        <div class="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
          <p class="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
            {{ locationStats?.message }}
          </p>
          
          <div class="flex gap-3">
            <UButton
              icon="i-tabler-refresh"
              :loading="isReindexing"
              :disabled="(locationStats?.statistics.photosNeedingReindex || 0) === 0"
              @click="startReindex(false)"
            >
              重新索引缺失的城市信息
            </UButton>
            
            <UButton
              icon="i-tabler-reload"
              variant="outline"
              :loading="isReindexing"
              :disabled="(locationStats?.statistics.totalPhotosWithGps || 0) === 0"
              @click="startReindex(true)"
            >
              强制重新索引所有
            </UButton>
          </div>
        </div>

        <!-- 说明信息 -->
        <UAlert
          icon="i-tabler-info-circle"
          color="info"
          variant="soft"
          title="操作说明"
          description="重新索引操作将为有GPS坐标但缺少城市信息的照片获取地理位置信息。由于API限制，处理速度较慢，请耐心等待。"
        />
      </div>
    </UCard>

    <!-- 重新索引结果 -->
    <UCard v-if="reindexResult">
      <template #header>
        <h2 class="text-lg font-semibold">重新索引结果</h2>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p class="text-sm text-blue-600 dark:text-blue-400">处理总数</p>
            <p class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ reindexResult.processed }}</p>
          </div>
          
          <div class="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p class="text-sm text-green-600 dark:text-green-400">更新数量</p>
            <p class="text-xl font-bold text-green-700 dark:text-green-300">{{ reindexResult.updated }}</p>
          </div>
          
          <div class="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
            <p class="text-sm text-purple-600 dark:text-purple-400">成功率</p>
            <p class="text-xl font-bold text-purple-700 dark:text-purple-300">{{ reindexResult.statistics.successRate }}</p>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p class="font-medium mb-2">{{ reindexResult.message }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            在 {{ reindexResult.statistics.totalFound }} 张照片中，成功处理了 {{ reindexResult.processed }} 张，
            更新了 {{ reindexResult.updated }} 张照片的城市信息。
          </p>
        </div>

        <!-- 错误信息 -->
        <div v-if="reindexResult.errors && reindexResult.errors.length > 0" class="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
          <h3 class="font-medium text-red-700 dark:text-red-300 mb-2">处理错误 ({{ reindexResult.errors.length }})</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div 
              v-for="error in reindexResult.errors" 
              :key="error.photoId"
              class="text-sm bg-white dark:bg-red-900 p-2 rounded"
            >
              <span class="font-mono text-red-600 dark:text-red-400">{{ error.photoId }}</span>: {{ error.error }}
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 进度提示 -->
    <UCard v-if="isReindexing">
      <div class="flex items-center gap-3 p-4">
        <UIcon name="i-tabler-loader-2" class="w-6 h-6 animate-spin text-primary" />
        <div>
          <p class="font-medium">正在重新索引城市信息...</p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            这可能需要几分钟时间，请不要关闭页面。由于API限制，每张照片之间有1秒延迟。
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style scoped></style>
