import { sql } from 'drizzle-orm'

export default eventHandler(async (event) => {
  await requireUserSession(event)

  try {
    // 获取有地理位置信息的照片总数
    const photosWithLocationResult = await useDB()
      .select({ count: sql<number>`count(*)` })
      .from(tables.photos)
      .where(sql`latitude IS NOT NULL AND longitude IS NOT NULL`)

    const photosWithLocation = photosWithLocationResult[0]?.count || 0

    // 获取总照片数
    const totalPhotosResult = await useDB()
      .select({ count: sql<number>`count(*)` })
      .from(tables.photos)

    const totalPhotos = totalPhotosResult[0]?.count || 0

    // 获取按国家分组的统计
    const countriesResult = await useDB()
      .select({
        country: tables.photos.country,
        count: sql<number>`count(*)`
      })
      .from(tables.photos)
      .where(sql`country IS NOT NULL`)
      .groupBy(tables.photos.country)
      .orderBy(sql`count(*) DESC`)

    // 获取按城市分组的统计
    const citiesResult = await useDB()
      .select({
        city: tables.photos.city,
        country: tables.photos.country,
        count: sql<number>`count(*)`
      })
      .from(tables.photos)
      .where(sql`city IS NOT NULL`)
      .groupBy(tables.photos.city, tables.photos.country)
      .orderBy(sql`count(*) DESC`)
      .limit(20) // 只返回前20个最常见的城市

    return {
      statistics: {
        totalPhotos,
        photosWithLocation,
        locationCoverage: totalPhotos > 0 ? (photosWithLocation / totalPhotos * 100).toFixed(1) : '0',
      },
      countries: countriesResult,
      cities: citiesResult,
    }
  } catch (error) {
    logger.chrono.error('Failed to fetch location statistics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch location statistics',
    })
  }
})
