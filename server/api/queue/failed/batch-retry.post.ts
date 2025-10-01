import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'

/**
 * 批量重试失败的任务
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const { taskIds, retryAll = false } = await readValidatedBody(
      event,
      z.object({
        taskIds: z.array(z.number()).optional(),
        retryAll: z.boolean().optional().default(false)
      }).parse
    )

    if (!retryAll && (!taskIds || taskIds.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Either taskIds array or retryAll flag must be provided'
      })
    }

    const db = useDB()

    let whereCondition
    if (retryAll) {
      whereCondition = eq(tables.pipelineQueue.status, 'failed')
    } else {
      whereCondition = inArray(tables.pipelineQueue.id, taskIds!)
    }

    // 检查要重试的任务
    const tasksToRetry = await db
      .select()
      .from(tables.pipelineQueue)
      .where(whereCondition)

    const failedTasks = tasksToRetry.filter(task => task.status === 'failed')
    
    if (failedTasks.length === 0) {
      return {
        success: true,
        message: 'No failed tasks found to retry',
        retriedCount: 0,
      }
    }

    // 批量重试失败的任务
    await db
      .update(tables.pipelineQueue)
      .set({
        status: 'pending',
        attempts: 0,
        errorMessage: null,
        statusStage: null,
        priority: 1, // 设置高优先级
        createdAt: new Date(), // 重新设置创建时间
        completedAt: null,
      })
      .where(
        retryAll 
          ? eq(tables.pipelineQueue.status, 'failed')
          : inArray(tables.pipelineQueue.id, failedTasks.map(t => t.id))
      )

    logger.chrono.info(`${failedTasks.length} failed tasks have been reset for retry by user`)

    return {
      success: true,
      message: `${failedTasks.length} failed tasks have been reset and will be retried`,
      retriedCount: failedTasks.length,
      taskIds: failedTasks.map(t => t.id),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to retry tasks',
    })
  }
})
