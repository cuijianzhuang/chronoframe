import { z } from 'zod'
import { eq } from 'drizzle-orm'

/**
 * 删除失败的任务
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

    // 检查任务是否存在
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
        statusMessage: `Cannot delete task that is not failed, current status: ${task.status}`
      })
    }

    // 删除任务
    await db
      .delete(tables.pipelineQueue)
      .where(eq(tables.pipelineQueue.id, taskId))

    logger.chrono.info(`Failed task ${taskId} has been deleted by user`)

    return {
      success: true,
      message: 'Failed task has been deleted',
      taskId,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to delete task',
    })
  }
})
