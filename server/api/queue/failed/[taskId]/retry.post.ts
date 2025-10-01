import { z } from 'zod'
import { eq } from 'drizzle-orm'

/**
 * 重试失败的任务
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const { taskId } = await getValidatedRouterParams(
      event,
      z.object({
        taskId: z.string().transform(val => parseInt(val))
      }).parse
    )

    const db = useDB()

    // 检查任务是否存在且状态为失败
    const task = await db
      .select()
      .from(tables.pipelineQueue)
      .where(eq(tables.pipelineQueue.id, taskId))
      .get()

    if (!task) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Task not found'
      })
    }

    if (task.status !== 'failed') {
      throw createError({
        statusCode: 400,
        statusMessage: `Task is not in failed status, current status: ${task.status}`
      })
    }

    // 重置任务状态，清除错误信息，重置尝试次数
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
      .where(eq(tables.pipelineQueue.id, taskId))

    logger.chrono.info(`Task ${taskId} has been reset for retry by user`)

    return {
      success: true,
      message: 'Task has been reset and will be retried',
      taskId,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to retry task',
    })
  }
})
