import { useStorageManager } from '~~/server/utils/useStorageManager'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { storageProvider } = useStorageManager(event)
  const photos = await storageProvider.listAll()
  return {
    urls: photos.map((photo) => storageProvider.getPublicUrl(photo.key)),
    objects: photos,
  }
})
