export const useViewerState = defineStore('photo-viewer-state', () => {
  const currentPhotoIndex = ref(0)
  const isViewerOpen = ref(false)
  const returnRoute = ref<string | null>(null)

  const openViewer = (index: number, route?: string | null) => {
    currentPhotoIndex.value = index
    isViewerOpen.value = true
    if (route) {
      returnRoute.value = route
    }
  }

  const switchToIndex = (index: number) => {
    currentPhotoIndex.value = index
  }

  const closeViewer = () => {
    isViewerOpen.value = false
  }

  const clearReturnRoute = () => {
    returnRoute.value = null
  }

  return {
    currentPhotoIndex,
    isViewerOpen,
    returnRoute,
    openViewer,
    switchToIndex,
    closeViewer,
    clearReturnRoute,
  }
})
