import { useStorageProvider } from '~~/server/utils/useStorageProvider'
import { getMessage, getPreferredLanguage } from '~~/server/utils/upload-messages'

export default eventHandler(async (event) => {
  await requireUserSession(event)

  const { storageProvider } = useStorageProvider(event)
  const key = getQuery(event).key as string | undefined
  const lang = getPreferredLanguage(event)

  if (!key) {
    const errorMsg = getMessage('error', 'required', lang, 'key')
    throw createError({
      statusCode: 400,
      statusMessage: errorMsg?.title || 'Missing required parameter',
      data: errorMsg,
    })
  }

  const contentType = getHeader(event, 'content-type') || 'application/octet-stream'
  
  // MIME 类型白名单验证（可通过环境变量配置）
  const config = useRuntimeConfig(event)
  const whitelistEnabled = config.UPLOAD_MIME_WHITELIST_ENABLED
  
  if (whitelistEnabled) {
    const whitelistStr = config.UPLOAD_MIME_WHITELIST
    const allowedTypes = whitelistStr
      ? whitelistStr.split(',').map((type: string) => type.trim()).filter(Boolean)
      : []
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(contentType)) {
      const errorMsg = getMessage('error', 'invalidType', lang, contentType, allowedTypes)
      throw createError({
        statusCode: 415,
        statusMessage: errorMsg?.title || 'Unsupported media type',
        data: errorMsg,
      })
    }
  }
  
  const raw = await readRawBody(event, false)
  if (!raw || !(raw instanceof Buffer)) {
    throw createError({
      statusCode: 400,
      statusMessage: lang === 'zh' ? '请求体为空' : 'Empty request body',
    })
  }
  
  // 简单大小限制（例如 128MB）
  const maxBytes = 128 * 1024 * 1024
  if (raw.byteLength > maxBytes) {
    const errorMsg = getMessage('error', 'tooLarge', lang, raw.byteLength, 128)
    throw createError({
      statusCode: 413,
      statusMessage: errorMsg?.title || 'Payload too large',
      data: errorMsg,
    })
  }

  const buffer = raw
  await storageProvider.create(key.replace(/^\/+/, ''), buffer, contentType)

  return { ok: true, key }
})


