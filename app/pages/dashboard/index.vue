<script lang="ts" setup>
import { CalendarHeatmap, type CalendarItem } from 'vue3-calendar-heatmap'
import 'vue3-calendar-heatmap/dist/style.css'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: $t('title.dashboard'),
})

const dayjs = useDayjs()
const { photos } = usePhotos()

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

const heatmapData = computed(() => {
  if (!photos.value || photos.value.length === 0) return []

  // 按日期分组统计照片数量
  const dateCountMap = new Map<string, number>()

  photos.value.forEach((photo) => {
    if (photo.dateTaken) {
      const date = dayjs(photo.dateTaken).format('YYYY-M-D')
      const currentCount = dateCountMap.get(date) || 0
      dateCountMap.set(date, currentCount + 1)
    }
  })

  const heatmapData = Array.from(dateCountMap.entries()).map(
    ([date, count]) => ({
      date,
      count,
    }),
  )

  return heatmapData
})
</script>

<template>
  <div class="flex flex-col gap-6 h-full p-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">仪表板概览</h1>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardIndicator
        title="照片总数"
        icon="tabler:photo"
        color="blue"
        :value="dashboardStats?.photos?.total || 0"
      />
      <DashboardIndicator
        title="本月新增"
        icon="tabler:photo-plus"
        color="green"
        :value="dashboardStats?.photos?.thisMonth || 0"
      />
      <DashboardIndicator
        title="队列状态"
        icon="tabler:loader"
        color="purple"
        :value="
          (dashboardStats?.workerPool?.activeWorkers || 0) > 0
            ? '处理中'
            : '空闲'
        "
      />
      <DashboardIndicator
        title="存储使用"
        icon="tabler:database"
        color="blue"
        :value="formatBytes(dashboardStats?.storage?.totalSize || 0)"
      />
    </div>

    <!-- 运行信息 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold pb-1.5">运行信息</h2>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">运行版本</p>
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
    <div class="grid grid-cols-1 lg:grid-cols-3 space-y-4 lg:gap-4">
      <!-- 左侧 -->
      <div class="col-span-2">
        <UCard>
          <ClientOnly>
            <CalendarHeatmap
              :values="heatmapData"
              :end-date="new Date()"
              :round="3"
              :no-data-text="'这天没有照片'"
              :tooltip-formatter="
                (item: CalendarItem) => {
                  return `${$dayjs(item.date).format('LL')}拍摄了 ${item.count || 0} 张照片`
                }
              "
              :locale="{
                less: '更少',
                more: '更多',
              }"
              :dark-mode="$colorMode.value === 'dark'"
            />
            <template #placeholder>
              <div class="flex items-center justify-center h-[164.5px]">
                <Icon
                  name="svg-spinners:180-ring-with-bg"
                  class="size-8 opacity-50"
                  mode="svg"
                />
              </div>
            </template>
          </ClientOnly>
        </UCard>
      </div>

      <!-- 右侧：系统资源监控 -->
      <div class="w-full space-y-4">
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

<style>
.vch__day__label,
.vch__month__label,
.vch__legend {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-500);
}

.vch__day__label,
.vch__month__label {
  font-size: var(--text-xs);
}
</style>
