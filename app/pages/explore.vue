<script lang="ts" setup>
import { motion } from 'motion-v'

useHead({
  title: '地图探索',
})

const route = useRoute()
const router = useRouter()

const MAPID = 'explore-map'
const { photos } = usePhotos()

const photosWithLocation = computed(() => {
  return photos.value.filter(
    (photo) =>
      photo.latitude !== null &&
      photo.longitude !== null &&
      photo.latitude !== undefined &&
      photo.longitude !== undefined,
  )
})

const currentPhotoId = ref<string | null>(null)
const mapInstance = ref<any>(null)

watch(currentPhotoId, (newId) => {
  if (newId) {
    router.replace({ query: { ...route.query, photoId: newId } })
  } else {
    const { photoId, ...rest } = route.query
    router.replace({ query: { ...rest } })
  }
})

const mapViewState = computed(() => {
  if (photosWithLocation.value.length === 0) {
    return {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 2,
    }
  }

  const latitudes = photosWithLocation.value.map((photo) => photo.latitude!)
  const longitudes = photosWithLocation.value.map((photo) => photo.longitude!)

  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)

  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2

  const latDiff = maxLat - minLat
  const lngDiff = maxLng - minLng
  const maxDiff = Math.max(latDiff, lngDiff)

  let zoom = 8
  if (maxDiff < 0.005) zoom = 16
  else if (maxDiff < 0.02) zoom = 14
  else if (maxDiff < 0.05) zoom = 12
  else if (maxDiff < 0.2) zoom = 10
  else if (maxDiff < 1) zoom = 8
  else if (maxDiff < 5) zoom = 6
  else if (maxDiff < 20) zoom = 5
  else if (maxDiff < 50) zoom = 4
  else zoom = 2

  return {
    longitude: centerLng,
    latitude: centerLat,
    zoom,
  }
})

const onMarkerPinClick = (photo: Photo) => {
  if (photo.id === currentPhotoId.value) {
    currentPhotoId.value = null
    return
  }
  currentPhotoId.value = photo.id
}

const onMarkerPinClose = () => {
  currentPhotoId.value = null
}

const onMapLoaded = (map: any) => {
  mapInstance.value = map
  const { photoId } = route.query
  if (photoId && typeof photoId === 'string') {
    const photo = photosWithLocation.value.find((photo) => photo.id === photoId)
    if (photo && photo.latitude && photo.longitude) {
      currentPhotoId.value = photoId
      nextTick(() => {
        map.flyTo({
          center: [photo.longitude, photo.latitude],
          zoom: 8,
          essential: true,
        })
      })
    }
  }
}
</script>

<template>
  <div class="w-full h-svh relative overflow-hidden">
    <MapGlassButton
      class="absolute top-4 left-4 z-10"
      @click="$router.push('/')"
    >
      <Icon
        name="tabler:home"
        class="size-5"
      />
    </MapGlassButton>

    <motion.div
      :initial="{ opacity: 0, scale: 1.1 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.6, delay: 0.1 }"
      class="w-full h-full"
    >
      <MapboxMap
        class="w-full h-full"
        :map-id="MAPID"
        :options="{
          style: 'mapbox://styles/hoshinosuzumi/cmev0eujf01dw01pje3g9cmlg',
          zoom: mapViewState.zoom,
          center: [mapViewState.longitude, mapViewState.latitude],
          config: {
            basemap: {
              lightPreset: 'night',
              colorThemes: 'faded',
            },
          },
          language: 'zh-Hans',
        }"
        @load="onMapLoaded"
      >
        <LazyMapMarkerPhotoPin
          v-for="photo in photosWithLocation"
          :key="photo.id"
          :photo="photo"
          :is-selected="photo.id === currentPhotoId"
          @click="onMarkerPinClick"
          @close="onMarkerPinClose"
        />
      </MapboxMap>
    </motion.div>
  </div>
</template>

<style scoped>
.mapboxgl-ctrl-logo {
  display: none !important;
}

.mapboxgl-ctrl-attrib {
  display: none !important;
}
</style>
