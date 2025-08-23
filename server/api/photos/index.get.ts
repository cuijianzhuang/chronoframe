import { useStorageManager } from '~~/server/utils/useStorageManager'

export default eventHandler(async (event) => {
  const { storageProvider } = useStorageManager(event)
  const photos = await storageProvider.listAll()
  return photos
})
