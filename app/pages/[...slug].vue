<script lang="ts" setup>
definePageMeta({
  // 固定 key 防止路径参数变化时创建新的实例
  key: 'photo-viewer-route',
})

const route = useRoute()
const router = useRouter()

const { switchToIndex, closeViewer, openViewer } = useViewerState()
const { currentPhotoIndex, isViewerOpen } = storeToRefs(useViewerState())

const { data } = useFetch('/api/photos')
const photos = computed(() => (data.value as Photo[]) || [])

const slug = computed(() => (route.params.slug as string[]) || [])
const photoId = computed(() => slug.value[0] || null)

watch(
  [photoId, photos],
  ([currentPhotoId, currentPhotos]) => {
    if (currentPhotoId && currentPhotos.length > 0) {
      const foundIndex = currentPhotos.findIndex(
        (photo) => photo.id === currentPhotoId,
      )
      if (foundIndex !== -1) {
        useHead({
          title: currentPhotos[foundIndex]?.title || 'Photo',
        })
        if (!isViewerOpen.value) {
          openViewer(foundIndex)
        } else {
          switchToIndex(foundIndex)
        }
      }
    } else if (!currentPhotoId) {
      closeViewer()
      useHead({
        title: 'Gallery',
      })
    }
  },
  { immediate: true },
)

const handleIndexChange = (newIndex: number) => {
  switchToIndex(newIndex)
  router.replace(`/${photos.value[newIndex]?.id}`)
}

const handleClose = () => {
  closeViewer()
  router.replace('/')
}
</script>

<template>
  <PhotoViewer
    :photos="photos"
    :current-index="currentPhotoIndex"
    :is-open="isViewerOpen"
    @close="handleClose"
    @index-change="handleIndexChange"
  />
</template>

<style scoped>
.loading-scan-wrapper {
  display: inline-block;
  position: relative;
}

.loading-scan-text {
  display: inline-block;
  background: linear-gradient(
    90deg,
    var(--ui-text-highlighted) 0%,
    var(--ui-text-highlighted) 30%,
    var(--ui-text-muted) 50%,
    var(--ui-text-highlighted) 70%,
    var(--ui-text-highlighted) 100%
  );
  background-size: 200% 100%;
  background-position: 200% 0;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  animation: scan-x-text 1.2s linear infinite;
}
@keyframes scan-x-text {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
