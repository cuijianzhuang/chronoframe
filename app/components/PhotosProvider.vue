<script lang="ts" setup>
const props = defineProps<{
  photos: Photo[]
}>()

const photosRef = toRef(props, 'photos')
providePhotos(photosRef)
</script>

<template>
  <slot />
</template>

<style scoped>

</style>
