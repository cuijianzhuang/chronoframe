<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
})

interface ProcessingStatus {
  recentPhotos: any[]
  timestamp: string
}

interface SystemHealth {
  uptime: number
  memory: {
    used: number
    total: number
  }
  processing: {
    active: boolean
    queued: number
  }
}

const { data: recentStatus, refresh: refreshRecent } =
  await useFetch<ProcessingStatus>('/api/photos/status', {
    server: false,
  })

const { data: healthStatus, refresh: refreshHealth } =
  await useFetch<SystemHealth>('/api/health/system', {
    server: false,
  })

const isLoading = ref(false)

const refreshData = async () => {
  isLoading.value = true
  try {
    await Promise.all([refreshRecent(), refreshHealth()])
  } finally {
    isLoading.value = false
  }
}

const triggerTestProcessing = async () => {
  isLoading.value = true
  try {
    await $fetch('/api/test/photo-processing', {
      method: 'POST'
    })
    
    await refreshData()
    useToast().add({
      title: '测试处理启动',
      description: '后台照片处理测试已开始',
      color: 'success',
    })
  } catch (error) {
    useToast().add({
      title: '测试失败',
      description: '无法启动测试处理',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// 定期刷新状态
const refreshInterval = setInterval(refreshData, 3000)

onBeforeUnmount(() => {
  clearInterval(refreshInterval)
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">后台处理监控</h1>
      <div class="flex gap-2">
        <UButton
          icon="i-tabler-refresh"
          variant="outline"
          :loading="isLoading"
          @click="refreshData"
        >
          刷新
        </UButton>
        <UButton
          icon="i-tabler-test-pipe"
          variant="outline"
          color="primary"
          :loading="isLoading"
          @click="triggerTestProcessing"
        >
          测试处理
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 最近处理的照片数量 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              最近处理照片
            </p>
            <p class="text-2xl font-bold">{{ recentStatus?.recentPhotos?.length || 0 }}</p>
          </div>
          <UIcon
            name="i-tabler-photo"
            class="w-8 h-8 text-blue-500"
          />
        </div>
      </UCard>

      <!-- 系统内存使用 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              内存使用率
            </p>
            <p class="text-2xl font-bold">
              {{ healthStatus?.memory ? Math.round((healthStatus.memory.used / healthStatus.memory.total) * 100) : 0 }}%
            </p>
          </div>
          <UIcon
            name="i-tabler-cpu"
            class="w-8 h-8 text-green-500"
          />
        </div>
      </UCard>

      <!-- 处理队列状态 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">队列任务</p>
            <p class="text-2xl font-bold">{{ healthStatus?.processing?.queued || 0 }}</p>
          </div>
          <UIcon
            name="i-tabler-list"
            class="w-8 h-8 text-yellow-500"
          />
        </div>
      </UCard>

      <!-- 系统运行时间 -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              运行时间
            </p>
            <p class="text-2xl font-bold">
              {{ healthStatus?.uptime ? Math.round(healthStatus.uptime / 3600) : 0 }}h
            </p>
          </div>
          <UIcon
            name="i-tabler-clock"
            class="w-8 h-8 text-purple-500"
          />
        </div>
      </UCard>
    </div>

    <!-- 后台处理配置 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">后台处理配置</h2>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">处理模式</p>
          <p class="text-lg font-bold">异步后台处理</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            响应时间
          </p>
          <p class="text-lg font-bold text-green-600">
            &lt; 50ms
          </p>
        </div>
      </div>
    </UCard>

    <!-- 系统状态 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">系统状态</h2>
      </template>

      <div class="flex items-center gap-3">
        <UBadge
          :color="healthStatus?.processing?.active !== false ? 'success' : 'warning'"
          variant="solid"
        >
          {{ healthStatus?.processing?.active !== false ? '正常运行' : '待机' }}
        </UBadge>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          后台处理系统{{ healthStatus?.processing?.active !== false ? '正在运行' : '处于待机状态' }}
        </span>
      </div>

      <div class="mt-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span>最后更新:</span>
          <span class="font-medium">
            {{ recentStatus?.timestamp ? new Date(recentStatus.timestamp).toLocaleString('zh-CN') : '未知' }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span>处理性能:</span>
          <span class="font-medium text-green-600">
            高效非阻塞
          </span>
        </div>
      </div>
    </UCard>

    <!-- 最近处理的照片 -->
    <UCard v-if="recentStatus?.recentPhotos?.length">
      <template #header>
        <h2 class="text-lg font-semibold">最近处理的照片</h2>
      </template>

      <div class="space-y-2">
        <div 
          v-for="photo in recentStatus.recentPhotos.slice(0, 5)" 
          :key="photo.id"
          class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
        >
          <div>
            <p class="font-medium">{{ photo.title || photo.id }}</p>
            <p class="text-sm text-gray-500">{{ photo.fileSize ? (photo.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '未知大小' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">{{ photo.lastModified ? new Date(photo.lastModified).toLocaleString('zh-CN') : '未知时间' }}</p>
            <UBadge color="success" variant="soft">已完成</UBadge>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style scoped></style>
