export default eventHandler(async (_event) => {
  const db = useDB()

  // 获取所有相册
  const albums = await db.select().from(tables.albums)

  // 为每个相册获取照片
  const albumsWithPhotos = await Promise.all(
    albums.map(async (album) => {
      const photos = await db
        .select({
          photo: tables.photos,
          position: tables.albumPhotos.position,
        })
        .from(tables.albumPhotos)
        .innerJoin(
          tables.photos,
          eq(tables.albumPhotos.photoId, tables.photos.id),
        )
        .where(eq(tables.albumPhotos.albumId, album.id))
        .orderBy(tables.albumPhotos.position)

      return {
        ...album,
        photos: photos.map((p) => p.photo),
      }
    }),
  )

  return albumsWithPhotos
})
