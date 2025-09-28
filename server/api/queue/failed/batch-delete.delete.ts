import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'

/**
 * 批量删除失败的任务
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const { taskIds, deleteAll = false } = await readValidatedBody(
      event,
      z.object({
        taskIds: z.array(z.number()).optional(),
        deleteAll: z.boolean().optional().default(false)
      }).parse
    )

    if (!deleteAll && (!taskIds || taskIds.length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Either taskIds array or deleteAll flag must be provided'
      })
    }

    const db = useDB()

    let whereCondition
    if (deleteAll) {
      whereCondition = eq(tables.pipelineQueue.status, 'failed')
    } else {
      whereCondition = inArray(tables.pipelineQueue.id, taskIds!)
    }

    // 检查要删除的任务
    const tasksToDelete = await db
      .select()
      .from(tables.pipelineQueue)
      .where(whereCondition)

    const failedTasks = tasksToDelete.filter(task => task.status === 'failed')
    
    if (failedTasks.length === 0) {
      return {
        success: true,
        message: 'No failed tasks found to delete',
        deletedCount: 0,
      }
    }

    // 批量删除失败的任务
    await db
      .delete(tables.pipelineQueue)
      .where(
        deleteAll 
          ? eq(tables.pipelineQueue.status, 'failed')
          : inArray(tables.pipelineQueue.id, failedTasks.map(t => t.id))
      )

    logger.chrono.info(`${failedTasks.length} failed tasks have been deleted by user`)

    return {
      success: true,
      message: `${failedTasks.length} failed tasks have been deleted`,
      deletedCount: failedTasks.length,
      taskIds: failedTasks.map(t => t.id),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to delete tasks',
    })
  }
})
