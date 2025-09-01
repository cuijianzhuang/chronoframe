import { isNull, and, isNotNull, sql, eq } from 'drizzle-orm'
import {
  extractLocationFromGPS,
  parseGPSCoordinates,
} from '~~/server/services/location/geocoding'

export default eventHandler(async (event) => {
  await requireUserSession(event)

  const body = await readBody(event)
  const { force = false } = body

  try {
    // 查找EXIF中有GPS坐标但数据库中缺少完整位置信息的照片
    const photosWithExif = await useDB()
      .select({
        id: tables.photos.id,
        exif: tables.photos.exif,
        latitude: tables.photos.latitude,
        longitude: tables.photos.longitude,
        city: tables.photos.city,
        country: tables.photos.country,
        locationName: tables.photos.locationName,
      })
      .from(tables.photos)
      .where(isNotNull(tables.photos.exif))

    // 筛选需要处理的照片
    const photosToUpdate: typeof photosWithExif = []

    for (const photo of photosWithExif) {
      const exif = photo.exif as any
      if (!exif) continue

      // 检查EXIF中是否有GPS数据
      const hasGpsInExif =
        (exif.GPSLatitude && exif.GPSLongitude) || exif.GPSCoordinates

      if (!hasGpsInExif) continue

      // 根据force参数决定处理条件
      let shouldProcess = false

      if (force) {
        // 强制重新索引所有有GPS的照片
        shouldProcess = true
      } else {
        // 只处理缺少GPS坐标或城市信息的照片
        const needsGpsReindex = !photo.latitude || !photo.longitude
        const needsLocationReindex =
          !photo.city ||
          !photo.country ||
          photo.city === '' ||
          photo.country === ''
        shouldProcess = needsGpsReindex || needsLocationReindex
      }

      if (shouldProcess) {
        photosToUpdate.push(photo)
      }
    }

    if (photosToUpdate.length === 0) {
      return {
        message: '没有需要重新索引的照片',
        processed: 0,
        updated: 0,
      }
    }

    logger.chrono.info(
      `Found ${photosToUpdate.length} photos to reindex city information`,
    )

    let processed = 0
    let updated = 0
    const errors: Array<{ photoId: string; error: string }> = []

    // 批量处理照片，添加延迟以避免API限制
    for (const photo of photosToUpdate) {
      try {
        processed++

        logger.chrono.info(
          `Processing photo ${photo.id} (${processed}/${photosToUpdate.length})`,
        )

        const exif = photo.exif as any
        let latitude = photo.latitude
        let longitude = photo.longitude

        // 如果数据库中没有GPS坐标，从EXIF重新提取
        if (!latitude || !longitude) {
          const gpsCoords = parseGPSCoordinates(exif)
          latitude = gpsCoords.latitude || null
          longitude = gpsCoords.longitude || null

          if (!latitude || !longitude) {
            logger.chrono.warn(
              `No valid GPS coordinates found in EXIF for photo ${photo.id}`,
            )
            continue
          }

          logger.chrono.info(
            `Extracted GPS coordinates from EXIF: ${latitude}, ${longitude}`,
          )
        }

        // 重新获取地理位置信息
        const locationInfo = await extractLocationFromGPS(latitude, longitude)

        if (locationInfo && (locationInfo.city || locationInfo.country)) {
          // 只有当获取到新的位置信息时才更新
          const shouldUpdate =
            force ||
            !photo.city ||
            !photo.country ||
            photo.city !== locationInfo.city ||
            photo.country !== locationInfo.country ||
            !photo.latitude ||
            !photo.longitude

          if (shouldUpdate) {
            await useDB()
              .update(tables.photos)
              .set({
                latitude: latitude,
                longitude: longitude,
                city: locationInfo.city || photo.city,
                country: locationInfo.country || photo.country,
                locationName: locationInfo.locationName || photo.locationName,
              })
              .where(eq(tables.photos.id, photo.id))

            updated++

            logger.chrono.success(
              `Updated photo ${photo.id}: ${latitude}, ${longitude} -> ${locationInfo.city}, ${locationInfo.country}`,
            )
          } else {
            logger.chrono.info(
              `Photo ${photo.id} already has up-to-date location info`,
            )
          }
        } else {
          logger.chrono.warn(
            `No location info found for photo ${photo.id} at ${latitude}, ${longitude}`,
          )
        }

        // 添加延迟以遵守API速率限制（Nominatim要求至少1秒间隔）
        if (processed < photosToUpdate.length) {
          await new Promise((resolve) => setTimeout(resolve, 1100))
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        logger.chrono.error(`Failed to process photo ${photo.id}:`, error)
        errors.push({
          photoId: photo.id,
          error: errorMessage,
        })
      }
    }

    const result = {
      message: `位置信息重新索引完成`,
      processed,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      statistics: {
        totalFound: photosToUpdate.length,
        successRate:
          processed > 0
            ? (((processed - errors.length) / processed) * 100).toFixed(1) + '%'
            : '0%',
      },
    }

    logger.chrono.success(
      `Location reindexing completed: ${updated} photos updated out of ${processed} processed`,
    )

    return result
  } catch (error) {
    logger.chrono.error('Failed to reindex location information:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to reindex location information',
    })
  }
})
