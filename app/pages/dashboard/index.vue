<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: $t('title.dashboard'),
})

const dayjs = useDayjs()

const { data: dashboardStats, refresh: refreshStats } =
  await useFetch('/api/system/stats')

const isLoading = ref(false)

const refreshData = async () => {
  isLoading.value = true
  try {
    await Promise.all([refreshStats()])
  } finally {
    isLoading.value = false
  }
}

const refreshInterval = setInterval(refreshData, 5000)

onBeforeUnmount(() => {
  clearInterval(refreshInterval)
})

const systemStatus = computed(() => {
  if (!dashboardStats.value) return 'unknown'

  const memoryUsage = dashboardStats.value.memory
    ? (dashboardStats.value.memory.used / dashboardStats.value.memory.total) *
      100
    : 0

  if (memoryUsage > 90) return 'critical'
  if (memoryUsage > 70) return 'warning'
  return 'healthy'
})

// 趋势图表
const chartData = computed(() => {
  if (!dashboardStats.value?.trends) return { labels: [], data: [] }

  return {
    labels: dashboardStats.value.trends.map((item) => {
      const date = new Date(item.date || '')
      return dayjs(date).format('MM-DD')
    }),
    data: dashboardStats.value.trends.map((item) => item.count),
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">仪表板概览</h1>
    </div>

    <!-- 核心指标条 - 横向布局 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 照片总数 -->
      <div
        class="border bg-gradient-to-r from-blue-50 to-cyan-50 border-cyan-100 dark:from-blue-950 dark:to-cyan-950 dark:border-cyan-900 rounded-lg p-4 text-blue-400 dark:text-white"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90 font-medium">照片总数</p>
            <p class="text-lg font-bold">
              {{ dashboardStats?.photos?.total || 0 }}
            </p>
          </div>
          <UIcon
            name="i-tabler-photo"
            class="size-8 opacity-80"
          />
        </div>
      </div>

      <!-- 本月新增 -->
      <div
        class="border bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-100 dark:from-green-950 dark:to-emerald-950 dark:border-emerald-900 rounded-lg p-4 text-green-400 dark:text-white"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">本月新增</p>
            <p class="text-lg font-bold">
              {{ dashboardStats?.photos?.thisMonth || 0 }}
            </p>
          </div>
          <UIcon
            name="i-tabler-plus"
            class="w-8 h-8 opacity-80"
          />
        </div>
      </div>

      <!-- 处理中 -->
      <div
        class="border bg-gradient-to-r from-purple-50 to-violet-50 border-violet-100 dark:from-purple-950 dark:to-violet-950 dark:border-violet-900 rounded-lg p-4 text-purple-400 dark:text-white"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">队列状态</p>
            <p class="text-lg font-bold">
              {{
                (dashboardStats?.workerPool?.activeWorkers || 0) > 0
                  ? '处理中'
                  : '空闲'
              }}
            </p>
          </div>
          <UIcon
            name="i-tabler-loader"
            class="w-8 h-8 opacity-80"
          />
        </div>
      </div>

      <!-- 存储使用量 -->
      <div
        class="border bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-100 dark:from-indigo-950 dark:to-blue-950 dark:border-blue-900 rounded-lg p-4 text-indigo-400 dark:text-white"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm opacity-90">存储使用</p>
            <p class="text-lg font-bold">
              {{ formatBytes(dashboardStats?.storage?.totalSize || 0) }}
            </p>
          </div>
          <UIcon
            name="i-tabler-database"
            class="w-8 h-8 opacity-80"
          />
        </div>
      </div>
    </div>

    <!-- 运行信息 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold pb-1.5">运行信息</h2>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">应用版本</p>
          <NuxtLink
            class="text-lg font-bold hover:text-primary"
            target="_blank"
            external
            :to="`https://github.com/HoshinoSuzumi/chronoframe/releases/tag/v${$config.public.VERSION}`"
          >
            v{{ $config.public.VERSION }}
          </NuxtLink>
        </div>
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">运行时间</p>
          <p class="text-lg font-bold">
            {{
              dashboardStats?.uptime
                ? $dayjs.duration(dashboardStats.uptime, 'seconds').humanize()
                : '-'
            }}
          </p>
        </div>
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">运行环境</p>
          <UBadge
            :color="dashboardStats?.runningOn === 'docker' ? 'info' : 'success'"
            variant="soft"
          >
            {{ dashboardStats?.runningOn || 'unknown' }}
          </UBadge>
        </div>
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">最后更新</p>
          <p class="text-lg font-bold">
            {{ new Date().toLocaleDateString('zh-CN') }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- 详细统计区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 左侧：照片统计图表 -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between pb-1.5">
              <h2 class="text-lg font-semibold">新增照片趋势</h2>
              <div class="flex gap-2">
                <UBadge
                  color="info"
                  variant="soft"
                >
                  本周 {{ dashboardStats?.photos?.thisWeek || 0 }}
                </UBadge>
                <UBadge
                  color="success"
                  variant="soft"
                >
                  本月 {{ dashboardStats?.photos?.thisMonth || 0 }}
                </UBadge>
              </div>
            </div>
          </template>

          <!-- 简单的趋势展示 -->
          <div class="space-y-2">
            <div
              v-for="(trend, index) in dashboardStats?.trends || []"
              :key="trend.date"
              class="flex items-center gap-3"
            >
              <div class="text-sm text-neutral-500 dark:text-neutral-400 w-12">
                {{ chartData.labels[index] }}
              </div>
              <UProgress
                :model-value="
                  chartData.data[index] &&
                  chartData.data.length &&
                  chartData.data.length > 0
                    ? Math.max(...chartData.data) > 0
                      ? (chartData.data[index] / Math.max(...chartData.data)) *
                        100
                      : 0
                    : 1
                "
                color="info"
                class="flex-1"
              />
              <div class="text-sm font-medium w-8 text-right">
                {{ trend.count }}
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 右侧：系统资源监控 -->
      <div class="space-y-4">
        <!-- 内存使用 -->
        <UCard>
          <template #header>
            <h3 class="font-semibold pb-1.5">内存使用率</h3>
          </template>

          <div class="space-y-2">
            <UProgress
              :model-value="
                dashboardStats?.memory
                  ? Math.round(
                      (dashboardStats.memory.used /
                        dashboardStats.memory.total) *
                        100,
                    )
                  : 0
              "
              :color="
                systemStatus === 'healthy'
                  ? 'success'
                  : systemStatus === 'warning'
                    ? 'warning'
                    : systemStatus === 'critical'
                      ? 'error'
                      : 'neutral'
              "
              class="w-full"
            />
            <div class="flex justify-between text-sm">
              <div class="text-xs text-neutral-500 dark:text-neutral-400">
                {{
                  dashboardStats?.memory
                    ? `${Math.round((dashboardStats.memory.used / 1024 / 1024 / 1024) * 100) / 100}GB / ${Math.round((dashboardStats.memory.total / 1024 / 1024 / 1024) * 100) / 100}GB`
                    : '系统内存'
                }}
              </div>
              <span>
                {{
                  dashboardStats?.memory
                    ? Math.round(
                        (dashboardStats.memory.used /
                          dashboardStats.memory.total) *
                          100,
                      )
                    : 0
                }}%
              </span>
            </div>
          </div>
        </UCard>

        <!-- 队列详情 -->
        <UCard>
          <template #header>
            <h3 class="font-semibold pb-1.5">处理队列</h3>
          </template>

          <div class="space-y-1">
            <div class="flex justify-between items-center text-sm">
              <span>活跃 Workers</span>
              <UBadge variant="soft">
                {{ dashboardStats?.workerPool?.activeWorkers || 0 }}
              </UBadge>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span>总 Workers</span>
              <UBadge variant="soft">
                {{ dashboardStats?.workerPool?.totalWorkers || 0 }}
              </UBadge>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span>已处理</span>
              <UBadge variant="soft">
                {{ dashboardStats?.workerPool?.totalProcessed || 0 }}
              </UBadge>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span>出错数</span>
              <UBadge variant="soft">
                {{ dashboardStats?.workerPool?.totalErrors || 0 }}
              </UBadge>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span>成功率</span>
              <UBadge
                :color="
                  (dashboardStats?.workerPool?.averageSuccessRate || 0) > 90
                    ? 'success'
                    : (dashboardStats?.workerPool?.averageSuccessRate || 0) > 70
                      ? 'warning'
                      : 'error'
                "
                variant="soft"
              >
                {{
                  Math.round(
                    dashboardStats?.workerPool?.averageSuccessRate || 0,
                  )
                }}%
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
