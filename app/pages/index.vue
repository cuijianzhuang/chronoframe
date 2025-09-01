<script lang="ts" setup>
const { switchToIndex, closeViewer } = useViewerState()
const { currentPhotoIndex, isViewerOpen } = storeToRefs(useViewerState())

const { data } = useFetch('/api/photos')
const photos = computed(() => (data.value as Photo[]) || [])
</script>

<template>
  <PhotoViewer
    :photos="photos"
    :current-index="currentPhotoIndex"
    :is-open="isViewerOpen"
    @close="closeViewer"
    @index-change="switchToIndex"
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
