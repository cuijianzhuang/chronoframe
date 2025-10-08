import type {
  HubR2StorageConfig,
  StorageObject,
  StorageProvider,
  UploadOptions,
} from '../interfaces'

/**
 * @deprecated DO NOT use HubR2StorageProvider anymore, use S3StorageProvider instead
 */
export class HubR2StorageProvider implements StorageProvider {
  config: HubR2StorageConfig
  private logger?: Logger['storage']

  constructor(config: HubR2StorageConfig, logger?: Logger['storage']) {
    this.config = config
    this.logger = logger
  }
  getSignedUrl?(_key: string, _expiresIn?: number, _options?: UploadOptions): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getFileMeta(_key: string): Promise<StorageObject | null> {
    throw new Error('Method not implemented.')
  }

  async create(
    _key: string,
    _fileBuffer: Buffer,
    _contentType?: string,
  ): Promise<StorageObject> {
    throw new Error('Method not implemented.')
  }

  async delete(_key: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async get(_key: string): Promise<Buffer | null> {
    throw new Error('Method not implemented.')
  }

  getPublicUrl(key: string): string {
    const { cdnUrl } = this.config

    if (cdnUrl) {
      return `${cdnUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`
    }

    return key
  }

  async listAll(): Promise<StorageObject[]> {
    throw new Error('Method not implemented.')
  }

  listImages(): Promise<StorageObject[]> {
    throw new Error('Method not implemented.')
  }
}
