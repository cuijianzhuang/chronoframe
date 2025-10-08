import { useStorageProvider } from '~~/server/utils/useStorageProvider'
import { eq } from 'drizzle-orm'
import { generateSafePhotoId } from '~~/server/utils/file-utils'
import { getMessage, getPreferredLanguage } from '~~/server/utils/upload-messages'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { storageProvider } = useStorageProvider(event)
  const lang = getPreferredLanguage(event)

  const body = await readBody(event)
  const { fileName, contentType, skipDuplicateCheck } = body

  if (!fileName) {
    const errorMsg = getMessage('error', 'required', lang, 'fileName')
    throw createError({
      statusCode: 400,
      statusMessage: errorMsg?.title || 'Missing required parameter',
      data: errorMsg,
    })
  }

  try {
    const objectKey = `${(storageProvider.config?.prefix || '').replace(/\/+$/, '')}/${fileName}`
    const config = useRuntimeConfig(event)

    // 重复文件检测
    const duplicateCheckEnabled = config.UPLOAD_DUPLICATE_CHECK_ENABLED && !skipDuplicateCheck
    let existingPhoto = null

    if (duplicateCheckEnabled) {
      const photoId = generateSafePhotoId(objectKey)
      const db = useDB()

      existingPhoto = await db
        .select({
          id: tables.photos.id,
          title: tables.photos.title,
          storageKey: tables.photos.storageKey,
          originalUrl: tables.photos.originalUrl,
          thumbnailUrl: tables.photos.thumbnailUrl,
          dateTaken: tables.photos.dateTaken,
        })
        .from(tables.photos)
        .where(eq(tables.photos.id, photoId))
        .get()

      if (existingPhoto) {
        const checkMode = config.UPLOAD_DUPLICATE_CHECK_MODE || 'warn'

        if (checkMode === 'block') {
          // 阻止模式：直接拒绝上传
          const blockMsg = getMessage('duplicate', 'block', lang, fileName)
          throw createError({
            statusCode: 409,
            statusMessage: blockMsg?.title || 'File already exists',
            data: {
              duplicate: true,
              existingPhoto,
              ...blockMsg,
            },
          })
        } else if (checkMode === 'skip') {
          // 跳过模式：返回现有照片信息，不上传
          const skipMsg = getMessage('duplicate', 'skip', lang, fileName, existingPhoto)
          return {
            skipped: true,
            duplicate: true,
            existingPhoto,
            fileKey: objectKey,
            ...skipMsg,
          }
        }
        // 'warn' 模式：继续上传但返回警告信息
      }
    }

    // 若存储提供商支持预签名 URL，返回外部直传地址
    if (storageProvider.getSignedUrl) {
      const signedUrl = await storageProvider.getSignedUrl(
        objectKey,
        3600,
        {
          contentType: contentType || 'application/octet-stream',
        },
      )

      const response: any = {
        signedUrl,
        fileKey: objectKey,
        expiresIn: 3600,
      }

      if (existingPhoto) {
        const warnMsg = getMessage('duplicate', 'warn', lang, fileName, existingPhoto)
        response.duplicate = true
        response.existingPhoto = existingPhoto
        if (warnMsg) {
          response.warningInfo = warnMsg
        }
      }

      return response
    }

    // 否则回退到内部直传端点（需会话）
    const internalUploadUrl = `/api/photos/upload?key=${encodeURIComponent(objectKey)}`
    const response: any = {
      signedUrl: internalUploadUrl,
      fileKey: objectKey,
      expiresIn: 3600,
    }

    if (existingPhoto) {
      const warnMsg = getMessage('duplicate', 'warn', lang, fileName, existingPhoto)
      response.duplicate = true
      response.existingPhoto = existingPhoto
      if (warnMsg) {
        response.warningInfo = warnMsg
      }
    }

    return response
  } catch (error) {
    if ((error as any).statusCode) {
      throw error
    }
    logger.chrono.error('Failed to prepare upload:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to prepare upload' })
  }
})