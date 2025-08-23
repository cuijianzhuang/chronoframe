import { H3Event, EventHandlerRequest } from 'h3'
import { StorageProvider } from '../services/storage'

export const useStorageManager = (event: H3Event<EventHandlerRequest>) => {
  const storageProvider =
    event.context?.storage?.getProvider() as StorageProvider
  if (!storageProvider) {
    throw new Error('Storage provider not found')
  }
  return { storageProvider }
}
