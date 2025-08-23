export default eventHandler(async (event) => {
  const { storageProvider } = useStorageManager(event)
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid key' })
  }

  const url = storageProvider.getPublicUrl(decodeURIComponent(key))

  return { url }
})
