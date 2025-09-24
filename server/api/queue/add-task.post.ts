import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const { payload, priority, maxAttempts } = await readValidatedBody(
      event,
      z.object({
        payload: z.object({
          type: z.enum(['photo', 'live-photo-video']).default('photo'),
          storageKey: z.string().nonempty(),
        }),
        priority: z.number().min(0).max(9).optional().default(0),
        maxAttempts: z.number().min(1).max(5).optional().default(3),
      }).parse,
    )

    const workerPool = globalThis.__workerPool

    if (!workerPool) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Worker pool not initialized',
      })
    }

    const taskId = await workerPool.addTask(payload, {
      priority,
      maxAttempts,
    })

    return {
      success: true,
      taskId,
      message: 'Task added to queue successfully',
      payload: {
        storageKey: payload.storageKey,
        priority,
        maxAttempts,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : 'Failed to add task to queue',
    })
  }
})
