import { z } from 'zod'
import { eq, desc, sql } from 'drizzle-orm'

/**
 * 获取失败任务列表
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  try {
    const query = getQuery(event)
    const { 
      page = '1', 
      limit = '20', 
      type 
    } = await z.object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('20'),
      type: z.enum(['photo', 'live-photo-video']).optional()
    }).parseAsync(query)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    const db = useDB()

    // 构建查询条件
    let whereCondition = eq(tables.pipelineQueue.status, 'failed')
    
    // 构建查询
    const queryBuilder = db
      .select({
        id: tables.pipelineQueue.id,
        payload: tables.pipelineQueue.payload,
        attempts: tables.pipelineQueue.attempts,
        maxAttempts: tables.pipelineQueue.maxAttempts,
        errorMessage: tables.pipelineQueue.errorMessage,
        createdAt: tables.pipelineQueue.createdAt,
        completedAt: tables.pipelineQueue.completedAt,
      })
      .from(tables.pipelineQueue)
      .where(whereCondition)
      .orderBy(desc(tables.pipelineQueue.createdAt))
      .limit(limitNum)
      .offset(offset)

    const failedTasks = await queryBuilder

    // 统计总数
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tables.pipelineQueue)
      .where(whereCondition)

    const total = totalResult[0].count

    // 格式化结果
    const formattedTasks = failedTasks.map(task => ({
      id: task.id,
      type: task.payload.type,
      storageKey: task.payload.storageKey,
      attempts: task.attempts,
      maxAttempts: task.maxAttempts,
      errorMessage: task.errorMessage,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    }))

    return {
      success: true,
      data: {
        tasks: formattedTasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to get failed tasks',
    })
  }
})
