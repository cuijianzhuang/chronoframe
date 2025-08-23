import {
  S3StorageProvider,
  StorageConfig,
  StorageManager,
} from '../services/storage'

export default nitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()

  const devConfigs: Record<'s3' | 'r2', StorageConfig> = {
    s3: {
      provider: (config.STORAGE_PROVIDER as StorageConfig['provider']) || 's3',
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
      maxKeys: 100,
    },
  }

  const storageManager = new StorageManager(devConfigs.r2, logger.storage)

  nitroApp.hooks.hook('request', (event) => {
    event.context.storage = storageManager
  })
})
