import { isNull, and, isNotNull, sql, eq } from 'drizzle-orm'
import { extractLocationFromGPS } from '~~/server/services/location/geocoding'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  
  const body = await readBody(event)
  const { force = false } = body

  try {
    // 查找有GPS坐标但缺少城市信息的照片
    let whereConditions = [
      isNotNull(tables.photos.latitude),
      isNotNull(tables.photos.longitude),
    ]

    // 如果不是强制重新索引，则只处理没有城市信息的照片
    if (!force) {
      whereConditions.push(
        sql`(city IS NULL OR city = '' OR country IS NULL OR country = '')`
      )
    }

    const photosToUpdate = await useDB()
      .select({
        id: tables.photos.id,
        latitude: tables.photos.latitude,
        longitude: tables.photos.longitude,
        city: tables.photos.city,
        country: tables.photos.country,
        locationName: tables.photos.locationName,
      })
      .from(tables.photos)
      .where(and(...whereConditions))

    if (photosToUpdate.length === 0) {
      return {
        message: '没有需要重新索引的照片',
        processed: 0,
        updated: 0,
      }
    }

    logger.chrono.info(`Found ${photosToUpdate.length} photos to reindex city information`)

    let processed = 0
    let updated = 0
    const errors: Array<{ photoId: string; error: string }> = []

    // 批量处理照片，添加延迟以避免API限制
    for (const photo of photosToUpdate) {
      try {
        processed++
        
        logger.chrono.info(`Processing photo ${photo.id} (${processed}/${photosToUpdate.length})`)

        // 重新获取地理位置信息
        const locationInfo = await extractLocationFromGPS(
          photo.latitude!,
          photo.longitude!
        )

        if (locationInfo && (locationInfo.city || locationInfo.country)) {
          // 只有当获取到新的位置信息时才更新
          const shouldUpdate = force || 
            !photo.city || 
            !photo.country || 
            photo.city !== locationInfo.city ||
            photo.country !== locationInfo.country

          if (shouldUpdate) {
            await useDB()
              .update(tables.photos)
              .set({
                city: locationInfo.city || photo.city,
                country: locationInfo.country || photo.country,
                locationName: locationInfo.locationName || photo.locationName,
              })
              .where(eq(tables.photos.id, photo.id))

            updated++
            
            logger.chrono.success(
              `Updated photo ${photo.id}: ${locationInfo.city}, ${locationInfo.country}`
            )
          } else {
            logger.chrono.info(`Photo ${photo.id} already has up-to-date location info`)
          }
        } else {
          logger.chrono.warn(`No location info found for photo ${photo.id} at ${photo.latitude}, ${photo.longitude}`)
        }

        // 添加延迟以遵守API速率限制（Nominatim要求至少1秒间隔）
        if (processed < photosToUpdate.length) {
          await new Promise(resolve => setTimeout(resolve, 1100))
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.chrono.error(`Failed to process photo ${photo.id}:`, error)
        errors.push({
          photoId: photo.id,
          error: errorMessage
        })
      }
    }

    const result = {
      message: `城市信息重新索引完成`,
      processed,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      statistics: {
        totalFound: photosToUpdate.length,
        successRate: processed > 0 ? ((processed - errors.length) / processed * 100).toFixed(1) + '%' : '0%'
      }
    }

    logger.chrono.success(`City reindexing completed: ${updated} photos updated out of ${processed} processed`)

    return result

  } catch (error) {
    logger.chrono.error('Failed to reindex city information:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reindex city information',
    })
  }
})
