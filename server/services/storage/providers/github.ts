import { StorageObject, StorageProvider } from '../interfaces'

export class GitHubStorageProvider implements StorageProvider {
  create(key: string, data: Buffer): Promise<StorageObject> {
    throw new Error('Method not implemented.')
  }
  delete(key: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  get(key: string): Promise<Buffer | null> {
    throw new Error('Method not implemented.')
  }
  getPublicUrl(key: string): string {
    throw new Error('Method not implemented.')
  }
  listAll(): Promise<StorageObject[]> {
    throw new Error('Method not implemented.')
  }
  listImages(): Promise<StorageObject[]> {
    throw new Error('Method not implemented.')
  }
}
