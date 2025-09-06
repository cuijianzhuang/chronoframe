interface PhotosContext {
  photos: Ref<Photo[]>
  getPhotoById: (id: string) => Photo | undefined
  filterPhotos: (predicate: (photo: Photo) => boolean) => Photo[]
  totalCount: ComputedRef<number>
}

const PhotosContextKey = Symbol('PhotosContext') as InjectionKey<PhotosContext>

export function providePhotos(photos: Ref<Photo[]>) {
  const context: PhotosContext = {
    photos,
    getPhotoById: (id: string) => {
      return photos.value.find(photo => photo.id === id)
    },
    filterPhotos: (predicate: (photo: Photo) => boolean) => {
      return photos.value.filter(predicate)
    },
    totalCount: computed(() => photos.value.length)
  }

  provide(PhotosContextKey, context)
  
  return context
}

export function usePhotos(): PhotosContext {
  const context = inject(PhotosContextKey)
  
  if (!context) {
    throw new Error('usePhotos must be used within a PhotosProvider')
  }
  
  return context
}
