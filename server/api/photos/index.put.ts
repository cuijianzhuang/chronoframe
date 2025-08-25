import sharp from 'sharp'
import { execPhotoPipelineAsync } from '~~/server/services/photo/pipeline-async'
import { useStorageProvider } from '~~/server/utils/useStorageProvider'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { storageProvider } = useStorageProvider(event)
  const formData = await readFormData(event)
  
  // 尝试从两个可能的字段名获取文件
  const file = (formData.get('file') || formData.get('files')) as File | null
  
  if (!file || Array.isArray(file)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File field is required',
    })
  }

  const originalObject = await storageProvider.create(
    `${file.name}`,
    Buffer.from(await file.arrayBuffer()),
  )

  // 立即返回响应，不等待处理完成
  const processingPromise = processPhotoInBackground(originalObject.key, originalObject)

  // 返回处理中的响应
  return {
    message: 'Photo upload successful, processing in background',
    fileKey: originalObject.key,
    fileName: file.name,
    status: 'processing'
  }
})

// 后台处理函数
async function processPhotoInBackground(s3key: string, originalObject: any) {
  try {
    logger.chrono.info('Starting background photo processing for', s3key)
    
    const photo = await execPhotoPipelineAsync(s3key, originalObject)

    if (!photo) {
      logger.chrono.error('Photo processing failed for', s3key)
      return
    }

    await useDB().insert(tables.photos).values(photo).execute()
    logger.chrono.success('Background photo processing completed for', photo.title || photo.storageKey)
  } catch (error) {
    logger.chrono.error('Background photo processing error for', s3key, error)
  }
}
