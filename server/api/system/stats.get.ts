import { sql, and, gte } from 'drizzle-orm'
import * as si from 'systeminformation'
import { readFileSync } from 'node:fs'

async function getQueueStats() {
  const workerPool = globalThis.__workerPool
  return workerPool ? workerPool.getPoolStats() : null
}

async function checkIfDocker(): Promise<boolean> {
  try {
    // 检查是否存在Docker特有的文件
    const fs = await import('fs')
    return fs.existsSync('/.dockerenv') || fs.existsSync('/proc/1/cgroup')
  } catch {
    return false
  }
}

// 在Docker容器中获取内存信息
async function getDockerMemoryInfo(): Promise<{
  used: number
  total: number
} | null> {
  try {
    // 尝试从/proc/meminfo读取内存信息
    const meminfo = readFileSync('/proc/meminfo', 'utf8')
    const lines = meminfo.split('\n')

    let totalMem = 0
    let availableMem = 0

    for (const line of lines) {
      if (line.startsWith('MemTotal:')) {
        totalMem = parseInt(line.split(/\s+/)[1]) * 1024 // 转换为字节
      } else if (line.startsWith('MemAvailable:')) {
        availableMem = parseInt(line.split(/\s+/)[1]) * 1024 // 转换为字节
      }
    }

    if (totalMem > 0) {
      return {
        total: totalMem,
        used: totalMem - availableMem,
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to read /proc/meminfo:', error)
    return null
  }
}

async function getMemoryStats() {
  let memoryInfo: {
    used: number
    total: number
  } | null = null
  try {
    const isDocker = await checkIfDocker()

    if (isDocker) {
      memoryInfo = await getDockerMemoryInfo()
    }

    if (!memoryInfo) {
      const sysMemInfo = await si.mem()
      memoryInfo = {
        used: sysMemInfo.used,
        total: sysMemInfo.total,
      }
    }
  } catch (error) {
    console.warn(
      'Failed to get system memory info, falling back to process info:',
      error,
    )
    const memUsage = process.memoryUsage()
    memoryInfo = {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
    }
  }

  return memoryInfo
}

export default eventHandler(async (event) => {
  await requireUserSession(event)

  // 获取基础统计
  const totalPhotos = await useDB()
    .select({ count: sql<number>`count(*)` })
    .from(tables.photos)
    .get()

  // 获取今日新增照片数量
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const todayPhotos = await useDB()
    .select({ count: sql<number>`count(*)` })
    .from(tables.photos)
    .where(gte(tables.photos.dateTaken, todayISO))
    .get()

  // 获取本周新增照片数量
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)
  const weekAgoISO = weekAgo.toISOString()

  const weekPhotos = await useDB()
    .select({ count: sql<number>`count(*)` })
    .from(tables.photos)
    .where(gte(tables.photos.dateTaken, weekAgoISO))
    .get()

  // 获取本月新增照片数量
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthStartISO = monthStart.toISOString()

  const monthPhotos = await useDB()
    .select({ count: sql<number>`count(*)` })
    .from(tables.photos)
    .where(gte(tables.photos.dateTaken, monthStartISO))
    .get()

  // 获取存储统计（估算）
  const storageStats = await useDB()
    .select({
      totalSize: sql<number>`COALESCE(sum(file_size), 0)`,
      avgSize: sql<number>`COALESCE(avg(file_size), 0)`,
      maxSize: sql<number>`COALESCE(max(file_size), 0)`,
    })
    .from(tables.photos)
    .get()

  // 获取最近7天的上传趋势
  const trendData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateISO = date.toISOString()

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateISO = nextDate.toISOString()

    const dayCount = await useDB()
      .select({ count: sql<number>`count(*)` })
      .from(tables.photos)
      .where(
        and(
          gte(tables.photos.dateTaken, dateISO),
          sql`${tables.photos.dateTaken} < ${nextDateISO}`,
        ),
      )
      .get()

    trendData.push({
      date: date.toISOString().split('T')[0],
      count: dayCount?.count || 0,
    })
  }

  return {
    uptime: process.uptime() || 0,
    runningOn: (await checkIfDocker())
      ? 'docker'
      : (await si.osInfo().then((info) => info.distro)) || 'unknown',
    memory: (await getMemoryStats()) || { used: 0, total: 0 },
    photos: {
      total: totalPhotos?.count || 0,
      today: todayPhotos?.count || 0,
      thisWeek: weekPhotos?.count || 0,
      thisMonth: monthPhotos?.count || 0,
    },
    workerPool: (await getQueueStats()) || null,
    storage: {
      totalSize: storageStats?.totalSize || 0,
      averageSize: storageStats?.avgSize || 0,
      maxSize: storageStats?.maxSize || 0,
    },
    trends: trendData.toReversed(),
    timestamp: new Date().toISOString(),
  }
})
