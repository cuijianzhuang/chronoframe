import sharp from 'sharp'

export default eventHandler(async (event) => {
  const { storageProvider } = useStorageProvider(event)
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid key' })
  }

  const photo = await storageProvider.get(`${key}`)
  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
  }
  logger.chrono.info('Convert thumb to jpeg from key', key)
  const sharpInst = sharp(photo).rotate()
  return await sharpInst.jpeg({ quality: 85 }).toBuffer()
})
