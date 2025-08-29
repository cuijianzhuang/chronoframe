import { useStorageProvider } from '~~/server/utils/useStorageProvider'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  
  const { storageProvider } = useStorageProvider(event)
  
  // 检查存储提供商是否支持预签名 URL
  if (!storageProvider.getSignedUrl) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Storage provider does not support signed URLs',
    })
  }

  const body = await readBody(event)
  const { fileName, contentType } = body

  if (!fileName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'fileName is required',
    })
  }

  try {
    // 生成唯一的文件名，使用时间戳前缀避免冲突
    const uniqueFileName = `${fileName}`
    
    // 获取预签名 URL，设置1小时过期时间
    const signedUrl = await storageProvider.getSignedUrl(
      uniqueFileName, 
      3600, // 1小时过期
      {
        contentType: contentType || 'application/octet-stream',
      }
    )

    return {
      signedUrl,
      fileKey: uniqueFileName,
      expiresIn: 3600,
    }
  } catch (error) {
    logger.chrono.error('Failed to generate signed URL:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate signed URL',
    })
  }
})