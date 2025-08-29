import { execPhotoPipelineAsync } from '~~/server/services/photo/pipeline-async'
import { useStorageProvider } from '~~/server/utils/useStorageProvider'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  
  const { storageProvider } = useStorageProvider(event)
  const body = await readBody(event)
  const { fileKey, fileName, fileSize } = body

  if (!fileKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'fileKey is required',
    })
  }

  try {
    // 验证文件是否存在于存储中
    const fileBuffer = await storageProvider.get(fileKey)
    if (!fileBuffer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found in storage',
      })
    }

    // 创建存储对象信息
    const originalObject = {
      key: fileKey,
      size: fileSize || fileBuffer.length,
      lastModified: new Date(),
    }

    logger.chrono.info('Starting photo processing for', fileKey)

    // 异步处理照片
    processPhotoInBackground(fileKey, originalObject, fileName)

    return {
      message: 'Photo processing started',
      fileKey,
      status: 'processing'
    }
  } catch (error) {
    logger.chrono.error('Failed to start photo processing:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to start photo processing',
    })
  }
})

// 后台处理函数
async function processPhotoInBackground(s3key: string, originalObject: any, originalFileName?: string) {
  try {
    logger.chrono.info('Starting background photo processing for', s3key)
    
    const photo = await execPhotoPipelineAsync(s3key, originalObject)

    if (!photo) {
      logger.chrono.error('Photo processing failed for', s3key)
      return
    }

    // 如果有原始文件名，使用它作为标题
    if (originalFileName && !photo.title) {
      photo.title = originalFileName
    }

    await useDB().insert(tables.photos).values(photo).execute()
    logger.chrono.success('Background photo processing completed for', photo.title || photo.storageKey)
  } catch (error) {
    logger.chrono.error('Background photo processing error for', s3key, error)
  }
}
