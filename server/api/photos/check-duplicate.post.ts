import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { generateSafePhotoId } from '~~/server/utils/file-utils'
import { getMessage, getPreferredLanguage } from '~~/server/utils/upload-messages'

/**
 * 检查照片是否已存在
 * 可以检查单个或多个文件
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const lang = getPreferredLanguage(event)

  try {
    const { fileNames, storageKeys } = await readValidatedBody(
      event,
      z.object({
        fileNames: z.array(z.string()).optional(),
        storageKeys: z.array(z.string()).optional(),
      }).parse,
    )

    if (!fileNames && !storageKeys) {
      const errorMsg = getMessage('error', 'required', lang, 'fileNames or storageKeys')
      throw createError({
        statusCode: 400,
        statusMessage: errorMsg?.title || 'Missing required parameter',
        data: errorMsg,
      })
    }

    const db = useDB()
    const results = []

    // 检查文件名
    if (fileNames && fileNames.length > 0) {
      for (const fileName of fileNames) {
        // 生成 photoId（与上传时的逻辑相同）
        const { storageProvider } = useStorageProvider(event)
        const storageKey = `${(storageProvider.config?.prefix || '').replace(/\/+$/, '')}/${fileName}`
        const photoId = generateSafePhotoId(storageKey)

        // 查询数据库
        const existingPhoto = await db
          .select({
            id: tables.photos.id,
            title: tables.photos.title,
            storageKey: tables.photos.storageKey,
            originalUrl: tables.photos.originalUrl,
            thumbnailUrl: tables.photos.thumbnailUrl,
            dateTaken: tables.photos.dateTaken,
            fileSize: tables.photos.fileSize,
            width: tables.photos.width,
            height: tables.photos.height,
          })
          .from(tables.photos)
          .where(eq(tables.photos.id, photoId))
          .get()

        results.push({
          fileName,
          storageKey,
          photoId,
          exists: !!existingPhoto,
          photo: existingPhoto || null,
        })
      }
    }

    // 检查 storageKey
    if (storageKeys && storageKeys.length > 0) {
      for (const storageKey of storageKeys) {
        const photoId = generateSafePhotoId(storageKey)

        const existingPhoto = await db
          .select({
            id: tables.photos.id,
            title: tables.photos.title,
            storageKey: tables.photos.storageKey,
            originalUrl: tables.photos.originalUrl,
            thumbnailUrl: tables.photos.thumbnailUrl,
            dateTaken: tables.photos.dateTaken,
            fileSize: tables.photos.fileSize,
            width: tables.photos.width,
            height: tables.photos.height,
          })
          .from(tables.photos)
          .where(eq(tables.photos.id, photoId))
          .get()

        results.push({
          storageKey,
          photoId,
          exists: !!existingPhoto,
          photo: existingPhoto || null,
        })
      }
    }

    const duplicatesFound = results.filter(r => r.exists).length
    const successMsg = getMessage('success', 'check', lang, results.length, duplicatesFound)

    return {
      success: true,
      results,
      duplicatesFound,
      summary: successMsg || {
        title: lang === 'zh' ? '检查完成' : 'Check Complete',
        message: lang === 'zh'
          ? `已检查 ${results.length} 个文件，发现 ${duplicatesFound} 个重复文件`
          : `Checked ${results.length} files, found ${duplicatesFound} duplicates`,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    const errorMsg = getMessage('error', 'uploadFailed', lang, error.message)
    throw createError({
      statusCode: 500,
      statusMessage: errorMsg?.title || 'Failed to check duplicates',
      data: errorMsg,
    })
  }
})

