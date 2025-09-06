import type { BlobObject } from '@nuxthub/core'
import type {
  HubR2StorageConfig,
  StorageObject,
  StorageProvider,
} from '../interfaces'

const convertToStorageObject = (blob: BlobObject): StorageObject => {
  return {
    key: blob.pathname,
    size: blob.size,
    lastModified: blob.uploadedAt,
    etag: blob.httpEtag,
  }
}

export class HubR2StorageProvider implements StorageProvider {
  config: HubR2StorageConfig
  private logger?: Logger['storage']

  constructor(config: HubR2StorageConfig, logger?: Logger['storage']) {
    this.config = config
    this.logger = logger
  }

  async create(
    key: string,
    fileBuffer: Buffer,
    _contentType?: string,
  ): Promise<StorageObject> {
    const file = new File([new Uint8Array(fileBuffer)], key)

    if (!file || !file.size) {
      throw new Error('Invalid file')
    }

    ensureBlob(file, {
      maxSize: '128MB',
    })

    const blob = await hubBlob().put(key, file, {
      prefix: this.config.prefix,
    })

    return convertToStorageObject(blob)
  }

  async delete(key: string): Promise<void> {
    return await hubBlob().del(key)
  }

  async get(key: string): Promise<Buffer | null> {
    const blob = await hubBlob().get(key)
    if (!blob) {
      return null
    }
    const arrayBuffer = await blob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  getPublicUrl(key: string): string {
    const { cdnUrl } = this.config

    if (cdnUrl) {
      return `${cdnUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`
    }

    return key
  }

  async listAll(): Promise<StorageObject[]> {
    const { blobs } = await hubBlob().list({
      prefix: this.config.prefix,
      limit: this.config.maxKeys,
    })
    return blobs.map(convertToStorageObject)
  }

  listImages(): Promise<StorageObject[]> {
    throw new Error('Method not implemented.')
  }
}
