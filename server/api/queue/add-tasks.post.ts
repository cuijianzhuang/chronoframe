import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const { tasks, defaultPriority, defaultMaxAttempts } =
      await readValidatedBody(
        event,
        z.object({
          tasks: z
            .array(
              z.object({
                payload: z.object({
                  type: z.enum(['photo', 'live-photo-video']).default('photo'),
                  storageKey: z.string().nonempty(),
                }),
                priority: z.number().min(0).max(9).optional(),
                maxAttempts: z.number().min(1).max(5).optional(),
              }),
            )
            .min(1, 'At least one task is required')
            .max(1000, 'Too many tasks: maximum 1000 tasks per batch'),
          defaultPriority: z.number().min(0).max(9).optional().default(0),
          defaultMaxAttempts: z.number().min(1).max(5).optional().default(3),
        }).parse,
      )

    const workerPool = globalThis.__workerPool

    if (!workerPool) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Worker pool not initialized',
      })
    }

    const results = []
    const errors = []

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]

      try {
        const taskId = await workerPool.addTask(task.payload, {
          priority: task.priority ?? defaultPriority,
          maxAttempts: task.maxAttempts ?? defaultMaxAttempts,
        })

        results.push({
          index: i,
          taskId,
          storageKey: task.payload.storageKey,
          success: true,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : `Task ${i}: Unknown error`
        errors.push({
          index: i,
          storageKey: task.payload?.storageKey || 'unknown',
          error: errorMessage,
          success: false,
        })
      }
    }

    return {
      success: errors.length === 0,
      totalTasks: tasks.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${tasks.length} tasks: ${results.length} successful, ${errors.length} failed`,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : 'Failed to add tasks to queue',
    })
  }
})
