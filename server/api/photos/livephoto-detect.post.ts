import { batchTestLivePhotoDetection } from '~~/server/services/video/test-utils'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  
  const body = await readBody(event)
  const { action } = body
  
  if (!action) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Action is required',
    })
  }

  try {
    switch (action) {
      case 'batch-detect':
        // 批量检测现有照片的 LivePhoto 视频
        const results = await batchTestLivePhotoDetection()
        return {
          message: 'Batch LivePhoto detection completed',
          results
        }
        
      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid action. Use "batch-detect"',
        })
    }
  } catch (error) {
    logger.chrono.error('LivePhoto detection error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to perform LivePhoto detection',
    })
  }
})
