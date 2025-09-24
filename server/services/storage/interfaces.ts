export interface StorageObject {
  key: string
  size?: number
  etag?: string
  lastModified?: Date
}

export type S3StorageConfig = {
  provider: 's3'
  bucket?: string
  region?: string
  endpoint?: string
  prefix?: string
  cdnUrl?: string
  accessKeyId?: string
  secretAccessKey?: string
  maxKeys?: number
}

export type HubR2StorageConfig = {
  provider: 'hub-r2'
  prefix?: string
  maxKeys?: number
  cdnUrl?: string
}

export type GitHubStorageConfig = {
  provider: 'github'
  owner?: string
  repository?: string
  branch?: string
  path?: string
  prefix?: string
  token?: string
}

export type StorageConfig =
  | S3StorageConfig
  | HubR2StorageConfig
  | GitHubStorageConfig

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  encryption?: boolean
  ttl?: number
}

export interface StorageProvider {
  config?: StorageConfig
  create(
    key: string,
    fileBuffer: Buffer,
    contentType?: string,
  ): Promise<StorageObject>
  delete(key: string): Promise<void>
  get(key: string): Promise<Buffer | null>
  getPublicUrl(key: string): string
  getSignedUrl?(
    key: string,
    expiresIn?: number,
    options?: UploadOptions,
  ): Promise<string>
  getFileMeta(key: string): Promise<StorageObject | null>
  listAll(): Promise<StorageObject[]>
  listImages(): Promise<StorageObject[]>
}
