import type { StorageConfig } from '../services/storage'
import { StorageManager } from '../services/storage'

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

  const devConfigs: Record<'s3' | 'r2', StorageConfig> = {
    s3: {
      provider: (config.STORAGE_PROVIDER as StorageConfig['provider']) || 's3',
      bucket: config.provider.s3.bucket,
      region: config.provider.s3.region,
      endpoint: config.provider.s3.endpoint,
      prefix: config.provider.s3.prefix,
      cdnUrl: config.provider.s3.cdnUrl,
      accessKeyId: config.provider.s3.accessKeyId,
      secretAccessKey: config.provider.s3.secretAccessKey,
    },
    r2: {
      provider: 'hub-r2',
      prefix: 'photos/',
      cdnUrl: import.meta.dev
        ? 'http://localhost:3000/image/'
        : 'https://cdn-dev.lens.bh8.ga/',
      maxKeys: 100,
    },
  }

  const storageManager = new StorageManager(devConfigs.s3, logger.storage)

  // 设置全局实例
  globalStorageManager = storageManager

  nitroApp.hooks.hook('request', (event) => {
    event.context.storage = storageManager
  })
})
