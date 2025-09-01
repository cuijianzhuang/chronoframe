import { isNull, and, isNotNull, sql, eq } from 'drizzle-orm'
import {
  extractLocationFromGPS,
  parseGPSCoordinates,
} from '~~/server/services/location/geocoding'

export default eventHandler(async (event) => {
  await requireUserSession(event)

  try {
    // 获取统计信息：EXIF中有GPS坐标但数据库中缺少位置信息的照片
    const photosWithExif = await useDB()
      .select({
        id: tables.photos.id,
        exif: tables.photos.exif,
        latitude: tables.photos.latitude,
        longitude: tables.photos.longitude,
        city: tables.photos.city,
        country: tables.photos.country,
      })
      .from(tables.photos)
      .where(isNotNull(tables.photos.exif))

    // 分析照片的GPS和位置信息状态
    let totalWithGpsInExif = 0
    let needsLocationReindex = 0
    let needsGpsReindex = 0
    let photosWithCity = 0

    for (const photo of photosWithExif) {
      const exif = photo.exif as any
      if (!exif) continue

      // 检查EXIF中是否有GPS数据
      const hasGpsInExif =
        (exif.GPSLatitude && exif.GPSLongitude) || exif.GPSCoordinates

      if (hasGpsInExif) {
        totalWithGpsInExif++

        // 检查数据库中是否缺少GPS坐标（需要从EXIF重新提取）
        if (!photo.latitude || !photo.longitude) {
          needsGpsReindex++
        }
        // 检查是否缺少城市信息（需要地理编码）
        else if (
          !photo.city ||
          !photo.country ||
          photo.city === '' ||
          photo.country === ''
        ) {
          needsLocationReindex++
        }
        // 已有完整信息
        else {
          photosWithCity++
        }
      }
    }

    const needsReindex = needsGpsReindex + needsLocationReindex

    return {
      statistics: {
        totalPhotosWithGps: totalWithGpsInExif,
        photosWithCity: photosWithCity,
        photosNeedingReindex: needsReindex,
        photosNeedingGpsReindex: needsGpsReindex,
        photosNeedingLocationReindex: needsLocationReindex,
        coveragePercentage:
          totalWithGpsInExif > 0
            ? ((photosWithCity / totalWithGpsInExif) * 100).toFixed(1)
            : '0',
      },
      message:
        needsReindex > 0
          ? `发现 ${needsReindex} 张照片需要重新索引 (${needsGpsReindex} 张需要GPS重新提取, ${needsLocationReindex} 张需要城市信息重新索引)`
          : '所有有GPS信息的照片都已完成索引',
    }
  } catch (error) {
    logger.chrono.error('Failed to get reindex city statistics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get statistics',
    })
  }
})
