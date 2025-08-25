import sharp from 'sharp'
import { execPhotoPipeline } from '~~/server/services/photo/pipeline'
import { useStorageProvider } from '~~/server/utils/useStorageProvider'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { storageProvider } = useStorageProvider(event)
  const formData = await readFormData(event)
  const file = formData.get('files') as File | null
  if (!file || Array.isArray(file)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File field is required',
    })
  }

  const originalObject = await storageProvider.create(
    `${file.name}`,
    Buffer.from(await file.arrayBuffer()),
  )

  const photo = await execPhotoPipeline(originalObject.key, originalObject)

  if (!photo) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Photo processing failed',
    })
  }

  await useDB().insert(tables.photos).values(photo).execute()
  logger.chrono.success(
    'Photo processing completed.',
    photo.title || photo.storageKey,
  )

  return [originalObject]
})
