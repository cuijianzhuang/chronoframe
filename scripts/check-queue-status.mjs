#!/usr/bin/env node
/**
 * 检查和清理队列状态的脚本
 */

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq, sql } from 'drizzle-orm'
import { fileURLToPath } from 'url'
import path from 'path'

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// 数据库路径
const dbPath = path.join(projectRoot, 'data', 'app.sqlite3')

// 模拟数据库模式
const pipelineQueue = {
  id: 'integer',
  payload: 'text',
  priority: 'integer', 
  attempts: 'integer',
  maxAttempts: 'integer',
  status: 'text',
  statusStage: 'text',
  errorMessage: 'text',
  createdAt: 'integer',
  completedAt: 'integer'
}

async function checkQueueStatus() {
  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite)

  console.log('🔍 检查队列状态...\n')

  try {
    // 查询队列统计
    const stats = await db.all(sql`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(attempts) as avg_attempts
      FROM pipeline_queue 
      GROUP BY status
      ORDER BY status
    `)

    console.log('📊 队列状态统计:')
    stats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count} 任务 (平均尝试次数: ${stat.avg_attempts?.toFixed(1) || 0})`)
    })

    // 查找 in-stages 状态的任务（可能被阻塞）
    const inStagesTasks = await db.all(sql`
      SELECT id, payload, attempts, max_attempts, status_stage, error_message, created_at
      FROM pipeline_queue 
      WHERE status = 'in-stages'
      ORDER BY created_at DESC
    `)

    if (inStagesTasks.length > 0) {
      console.log('\n⚠️  发现可能被阻塞的任务 (in-stages 状态):')
      inStagesTasks.forEach(task => {
        const payload = JSON.parse(task.payload)
        const createdAt = new Date(task.created_at * 1000).toLocaleString()
        console.log(`  任务 ${task.id}: ${payload.type} - ${payload.storageKey}`)
        console.log(`    创建时间: ${createdAt}`)
        console.log(`    尝试次数: ${task.attempts}/${task.max_attempts}`)
        console.log(`    当前阶段: ${task.status_stage || 'N/A'}`)
        if (task.error_message) {
          console.log(`    错误信息: ${task.error_message}`)
        }
        console.log('')
      })
    }

    // 查找失败的 LivePhoto 任务
    const failedLivePhotoTasks = await db.all(sql`
      SELECT id, payload, attempts, max_attempts, error_message, created_at
      FROM pipeline_queue 
      WHERE status = 'failed' 
      AND json_extract(payload, '$.type') = 'live-photo-video'
      ORDER BY created_at DESC
      LIMIT 10
    `)

    if (failedLivePhotoTasks.length > 0) {
      console.log('\n❌ 最近失败的 LivePhoto 任务:')
      failedLivePhotoTasks.forEach(task => {
        const payload = JSON.parse(task.payload)
        const createdAt = new Date(task.created_at * 1000).toLocaleString()
        console.log(`  任务 ${task.id}: ${payload.storageKey}`)
        console.log(`    创建时间: ${createdAt}`)
        console.log(`    尝试次数: ${task.attempts}/${task.max_attempts}`)
        console.log(`    错误信息: ${task.error_message || 'N/A'}`)
        console.log('')
      })
    }

    // 查找等待重试的任务
    const pendingRetryTasks = await db.all(sql`
      SELECT id, payload, attempts, max_attempts, error_message, created_at
      FROM pipeline_queue 
      WHERE status = 'pending' 
      AND attempts > 0
      ORDER BY created_at DESC
      LIMIT 5
    `)

    if (pendingRetryTasks.length > 0) {
      console.log('\n🔄 等待重试的任务:')
      pendingRetryTasks.forEach(task => {
        const payload = JSON.parse(task.payload)
        const createdAt = new Date(task.created_at * 1000).toLocaleString()
        console.log(`  任务 ${task.id}: ${payload.type} - ${payload.storageKey}`)
        console.log(`    创建时间: ${createdAt}`)
        console.log(`    尝试次数: ${task.attempts}/${task.max_attempts}`)
        console.log(`    最后错误: ${task.error_message || 'N/A'}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ 检查队列状态时出错:', error)
  } finally {
    sqlite.close()
  }
}

async function cleanupBlockedTasks() {
  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite)

  console.log('\n🧹 清理被阻塞的任务...')

  try {
    // 将 in-stages 状态的任务重置为 pending
    const result = await db.run(sql`
      UPDATE pipeline_queue 
      SET 
        status = 'pending',
        priority = 1,
        status_stage = NULL
      WHERE status = 'in-stages'
    `)

    if (result.changes > 0) {
      console.log(`✅ 已重置 ${result.changes} 个被阻塞的任务为待处理状态`)
    } else {
      console.log('✅ 没有发现被阻塞的任务')
    }

  } catch (error) {
    console.error('❌ 清理任务时出错:', error)
  } finally {
    sqlite.close()
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--cleanup')) {
    await cleanupBlockedTasks()
  }
  
  await checkQueueStatus()
  
  console.log('\n💡 使用 --cleanup 参数来清理被阻塞的任务')
}

main().catch(console.error)
