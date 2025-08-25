import { StorageObject } from '~~/server/services/storage'
import { useStorageProvider } from '~~/server/utils/useStorageProvider'

export default eventHandler(async (event) => {
  // const { storageProvider } = useStorageProvider(event)
  // const photos = await storageProvider.listAll()
  // return {
  //   urls: photos.map((photo) => storageProvider.getPublicUrl(photo.key)),
  //   objects: photos as StorageObject[],
  // }
  return await useDB().select().from(tables.photos).orderBy(tables.photos.dateTaken).all()
})
