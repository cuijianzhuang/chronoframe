import { isNull, and, isNotNull, sql, eq } from 'drizzle-orm'
import { extractLocationFromGPS } from '~~/server/services/location/geocoding'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  
  try {
    // 获取统计信息：有GPS坐标但缺少城市信息的照片
    const statsResult = await useDB()
      .select({
        total: sql<number>`count(*)`
      })
      .from(tables.photos)
      .where(
        and(
          isNotNull(tables.photos.latitude),
          isNotNull(tables.photos.longitude),
          sql`(city IS NULL OR city = '' OR country IS NULL OR country = '')`
        )
      )

    const needsReindex = statsResult[0]?.total || 0

    // 获取总的有GPS坐标的照片数
    const totalWithGpsResult = await useDB()
      .select({
        total: sql<number>`count(*)`
      })
      .from(tables.photos)
      .where(
        and(
          isNotNull(tables.photos.latitude),
          isNotNull(tables.photos.longitude)
        )
      )

    const totalWithGps = totalWithGpsResult[0]?.total || 0

    // 获取已有城市信息的照片数
    const withCityResult = await useDB()
      .select({
        total: sql<number>`count(*)`
      })
      .from(tables.photos)
      .where(
        and(
          isNotNull(tables.photos.latitude),
          isNotNull(tables.photos.longitude),
          isNotNull(tables.photos.city),
          sql`city != ''`
        )
      )

    const withCity = withCityResult[0]?.total || 0

    return {
      statistics: {
        totalPhotosWithGps: totalWithGps,
        photosWithCity: withCity,
        photosNeedingReindex: needsReindex,
        coveragePercentage: totalWithGps > 0 ? ((withCity / totalWithGps) * 100).toFixed(1) : '0',
      },
      message: needsReindex > 0 
        ? `发现 ${needsReindex} 张照片需要重新索引城市信息`
        : '所有有GPS坐标的照片都已有城市信息'
    }

  } catch (error) {
    logger.chrono.error('Failed to get reindex city statistics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get statistics',
    })
  }
})
