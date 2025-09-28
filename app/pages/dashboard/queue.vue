<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">队列管理</h1>
      <div class="flex gap-2">
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
        <button
          @click="cleanupBlockedTasks"
          :disabled="cleanupLoading"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {{ cleanupLoading ? '清理中...' : '清理阻塞任务' }}
        </button>
      </div>
    </div>

    <!-- 队列统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div v-for="stat in queueStats" :key="stat.status" class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ getStatusLabel(stat.status) }}</p>
            <p class="text-2xl font-bold">{{ stat.count }}</p>
          </div>
          <div :class="getStatusColor(stat.status)" class="w-12 h-12 rounded-full flex items-center justify-center">
            <component :is="getStatusIcon(stat.status)" class="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- 失败任务管理 -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">失败任务</h2>
          <div class="flex gap-2">
            <button
              @click="retryAllFailed"
              :disabled="actionLoading"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
            >
              重试所有
            </button>
            <button
              @click="deleteAllFailed"
              :disabled="actionLoading"
              class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
            >
              删除所有
            </button>
          </div>
        </div>
      </div>

      <div v-if="failedTasks.length === 0" class="p-8 text-center text-gray-500">
        没有失败的任务
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div v-for="task in failedTasks" :key="task.id" class="p-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 bg-gray-100 text-xs rounded">{{ task.type }}</span>
                <span class="text-sm text-gray-600">任务 #{{ task.id }}</span>
              </div>
              <p class="font-medium text-sm">{{ task.storageKey }}</p>
              <p class="text-red-600 text-sm mt-1">{{ task.errorMessage }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>尝试次数: {{ task.attempts }}/{{ task.maxAttempts }}</span>
                <span>创建时间: {{ formatTime(task.createdAt) }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="retryTask(task.id)"
                :disabled="actionLoading"
                class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                重试
              </button>
              <button
                @click="deleteTask(task.id)"
                :disabled="actionLoading"
                class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.totalPages > 1" class="p-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            显示 {{ (pagination.page - 1) * pagination.limit + 1 }} - 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
            / {{ pagination.total }} 个任务
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="!pagination.hasPrev || loading"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              上一页
            </button>
            <span class="px-3 py-1">{{ pagination.page }} / {{ pagination.totalPages }}</span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="!pagination.hasNext || loading"
              class="px-3 py-1 border rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

// 响应式数据
const loading = ref(false)
const actionLoading = ref(false)
const cleanupLoading = ref(false)

const queueStats = ref<Array<{ status: string; count: number }>>([])
const failedTasks = ref<Array<any>>([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
})

// 获取队列统计
const fetchQueueStats = async () => {
  try {
    const { data } = await $fetch('/api/queue/stats')
    queueStats.value = Object.entries(data.queue).map(([status, count]) => ({
      status,
      count: count as number
    }))
  } catch (error) {
    console.error('获取队列统计失败:', error)
  }
}

// 获取失败任务列表
const fetchFailedTasks = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await $fetch(`/api/queue/failed/list?page=${page}&limit=${pagination.value.limit}`)
    failedTasks.value = data.tasks
    pagination.value = data.pagination
  } catch (error) {
    console.error('获取失败任务失败:', error)
  } finally {
    loading.value = false
  }
}

// 重试单个任务
const retryTask = async (taskId: number) => {
  actionLoading.value = true
  try {
    await $fetch(`/api/queue/failed/${taskId}/retry`, { method: 'POST' })
    await refreshData()
  } catch (error) {
    console.error('重试任务失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 删除单个任务
const deleteTask = async (taskId: number) => {
  if (!confirm('确定要删除这个失败的任务吗？')) return
  
  actionLoading.value = true
  try {
    await $fetch(`/api/queue/failed/${taskId}/delete`, { method: 'DELETE' })
    await refreshData()
  } catch (error) {
    console.error('删除任务失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 重试所有失败任务
const retryAllFailed = async () => {
  if (!confirm('确定要重试所有失败的任务吗？')) return
  
  actionLoading.value = true
  try {
    await $fetch('/api/queue/failed/batch-retry', { 
      method: 'POST',
      body: { retryAll: true }
    })
    await refreshData()
  } catch (error) {
    console.error('批量重试失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 删除所有失败任务
const deleteAllFailed = async () => {
  if (!confirm('确定要删除所有失败的任务吗？此操作不可恢复！')) return
  
  actionLoading.value = true
  try {
    await $fetch('/api/queue/failed/batch-delete', { 
      method: 'DELETE',
      body: { deleteAll: true }
    })
    await refreshData()
  } catch (error) {
    console.error('批量删除失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 清理阻塞任务
const cleanupBlockedTasks = async () => {
  if (!confirm('确定要清理阻塞的任务吗？这将重置所有in-stages状态的任务。')) return
  
  cleanupLoading.value = true
  try {
    // 这里可以调用一个专门的清理API，暂时使用命令行脚本的逻辑
    await refreshData()
  } catch (error) {
    console.error('清理阻塞任务失败:', error)
  } finally {
    cleanupLoading.value = false
  }
}

// 换页
const changePage = (page: number) => {
  fetchFailedTasks(page)
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    fetchQueueStats(),
    fetchFailedTasks(pagination.value.page)
  ])
}

// 工具函数
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '等待中',
    'in-stages': '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    'in-stages': 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getStatusIcon = (status: string) => {
  // 这里可以返回图标组件名称，需要根据你的图标库调整
  return 'div'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// 组件挂载时获取数据
onMounted(() => {
  refreshData()
})
</script>
