import { eq, and, sql, desc } from 'drizzle-orm'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  
  const query = getQuery(event)
  const { country, city, hasLocation } = query

  const whereConditions = []

  // 如果指定了只显示有位置信息的照片
  if (hasLocation === 'true') {
    whereConditions.push(sql`latitude IS NOT NULL AND longitude IS NOT NULL`)
  }

  // 如果指定了国家筛选
  if (country && typeof country === 'string') {
    whereConditions.push(eq(tables.photos.country, country))
  }

  // 如果指定了城市筛选
  if (city && typeof city === 'string') {
    whereConditions.push(eq(tables.photos.city, city))
  }

  try {
    const photos = await useDB()
      .select({
        id: tables.photos.id,
        title: tables.photos.title,
        thumbnailUrl: tables.photos.thumbnailUrl,
        dateTaken: tables.photos.dateTaken,
        latitude: tables.photos.latitude,
        longitude: tables.photos.longitude,
        country: tables.photos.country,
        city: tables.photos.city,
        locationName: tables.photos.locationName,
        tags: tables.photos.tags,
      })
      .from(tables.photos)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(tables.photos.dateTaken))

    return {
      photos,
      total: photos.length,
    }
  } catch (error) {
    logger.chrono.error('Failed to fetch photos with location:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch photos',
    })
  }
})
