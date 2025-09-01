<script lang="ts" setup>
const { data } = useFetch('/api/photos')

const route = useRoute()
const router = useRouter()
const { openViewer } = useViewerState()

useHead({
  title: 'Gallery',
  titleTemplate: (title) => `${title} - TimoYin's mems`,
})

const photos = computed(() => (data.value as Photo[]) || [])

// watch(
//   () => route.params.photoId,
//   (newPhotoId) => {
//     if (newPhotoId) {
//       const photo = photos.value.find((p) => p.id === newPhotoId)
//       if (photo) {
//         openViewer(photos.value.indexOf(photo))
//       }
//     }
//   },
// )
</script>

<template>
  <div class="h-svh px-1">
    <ClientOnly>
      <MasonryRoot
        :photos="photos"
        columns="auto"
      />
      <PhotoViewer :photos />
      <template #fallback>
        <div
          class="fixed inset-0 flex flex-col gap-4 items-center justify-center"
        >
          <LoaderAvatar />
          <span class="loading-scan-wrapper">
            <span class="text-base font-medium loading-scan-text">LOADING</span>
          </span>
        </div>
      </template>
    </ClientOnly>
  </div>
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
