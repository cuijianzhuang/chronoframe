export const useViewerState = defineStore('photo-viewer-state', () => {
  const currentPhotoIndex = ref(0)
  const isViewerOpen = ref(false)

  const openViewer = (index: number) => {
    currentPhotoIndex.value = index
    isViewerOpen.value = true
  }

  const closeViewer = () => {
    isViewerOpen.value = false
  }

  return {
    currentPhotoIndex,
    isViewerOpen,
    openViewer,
    closeViewer,
  }
})