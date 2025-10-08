import path from 'node:path'
import type { StorageConfig } from '../services/storage'
import { StorageManager } from '../services/storage'
import { logger } from '../utils/logger'

// 全局 storageManager 实例，可以在非请求上下文中使用
let globalStorageManager: StorageManager

export function getStorageManager(): StorageManager {
  if (!globalStorageManager) {
    throw new Error('Storage manager not initialized')
  }
  return globalStorageManager
}

export default nitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()

  const devConfigs: Record<'s3' | 'r2' | 'local', StorageConfig> = {
    s3: {
      provider: 's3',
      bucket: config.PROVIDER_S3_BUCKET,
      region: config.PROVIDER_S3_REGION,
      endpoint: config.PROVIDER_S3_ENDPOINT,
      prefix: config.PROVIDER_S3_PREFIX,
      cdnUrl: config.PROVIDER_S3_CDN_URL,
      accessKeyId: config.PROVIDER_S3_ACCESS_KEY_ID,
      secretAccessKey: config.PROVIDER_S3_SECRET_ACCESS_KEY,
    },
    r2: {
      provider: 'hub-r2',
      prefix: 'photos/',
      cdnUrl: import.meta.dev
        ? 'http://localhost:3000/image/'
        : 'https://cdn-dev.lens.bh8.ga/',
      maxKeys: 100,
    },
    local: {
      provider: 'local',
      basePath: process.env.NUXT_PROVIDER_LOCAL_PATH || path.resolve(process.cwd(), 'storage'),
      baseUrl: process.env.NUXT_PROVIDER_LOCAL_BASE_URL || '/storage',
      prefix: 'photos/',
    },
  }

  const selectedProvider = (config.STORAGE_PROVIDER as 's3' | 'r2' | 'local') || 's3'
  const storageManager = new StorageManager(
    devConfigs[selectedProvider],
    logger.storage,
  )

  // 设置全局实例
  globalStorageManager = storageManager

  nitroApp.hooks.hook('request', (event) => {
    event.context.storage = storageManager
  })

  // 本地存储路径校验与创建
  if (selectedProvider === 'local') {
    const localBase = (devConfigs.local as any).basePath as string
    try {
      if (!path.isAbsolute(localBase)) {
        logger.storage.warn(`LOCAL basePath is not absolute: ${localBase}`)
      }
      await import('node:fs').then(async (m) => {
        const fs = m.promises as typeof import('node:fs').promises
        await fs.mkdir(localBase, { recursive: true })
      })
      logger.storage.success(`Local storage ready at: ${localBase}`)
    } catch (err) {
      logger.storage.error('Failed to prepare local storage directory', err)
    }
  }
})
