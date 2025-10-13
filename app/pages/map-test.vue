<script lang="ts" setup>
import type { MapInstance } from '~~/shared/types/map'

const mapInstance = ref<MapInstance | null>(null)

watch(mapInstance, (newMap) => {
  if (newMap) {
    mapInstance.value?.flyTo({
      center: [-122.4, 37.8],
      zoom: 12,
      essential: true,
      duration: 3000,
    })
    console.log('Map instance is ready:', newMap)
  } else {
    console.log('Map instance is null')
  }
})

const onMapLoaded = (map: any) => {
  mapInstance.value = map
}
</script>

<template>
  <div class="w-full h-screen">
    <MapProvider @load="onMapLoaded">
      <slot />
    </MapProvider>
  </div>
</template>

<style scoped></style>
