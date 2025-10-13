<script lang="ts" setup>
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { Map as MapboxMap } from 'mapbox-gl'

const mapInstance = ref<MaplibreMap | MapboxMap | null>(null)

// function isMaplibreMap(map: any): map is MaplibreMap {
//   return map && typeof map.getStyle === 'function' && typeof map.setStyle === 'function'
// }
// function isMapboxMap(map: any): map is MapboxMap {
//   return map && typeof map.getStyle === 'function' && typeof map.setStyle === 'function'
// }

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
    <MapProvider @load="onMapLoaded"></MapProvider>
  </div>
</template>

<style scoped></style>
