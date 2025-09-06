<script lang="ts" setup>
import { motion } from 'motion-v'

useHead({
  title: '地图探索',
})

const MAPID = 'explore-map'
const { photos } = usePhotos()

// 筛选出有GPS坐标的照片
const photosWithLocation = computed(() => {
  return photos.value.filter(
    (photo) =>
      photo.latitude !== null &&
      photo.longitude !== null &&
      photo.latitude !== undefined &&
      photo.longitude !== undefined,
  )
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

onMounted(() => {
  console.log(`找到 ${photosWithLocation.value.length} 张有位置信息的照片`)
})
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
      :transition="{ duration: 0.6, delay: 1.5 }"
      class="w-full h-full"
    >
      <MapboxMap
        class="w-full h-full"
        :map-id="MAPID"
        :options="{
          style: 'mapbox://styles/mapbox/standard',
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
      >
        <!-- 为每张有位置信息的照片添加标记 -->
        <MapboxDefaultMarker
          v-for="photo in photosWithLocation"
          :key="photo.id"
          :marker-id="`photo-${photo.id}`"
          :lnglat="[photo.longitude, photo.latitude]"
          :options="{}"
        >
          <template #marker>
            <HoverCardRoot>
              <HoverCardTrigger as-child>
                <div
                  class="photo-marker"
                  :style="{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundImage: `url(${photo.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }"
                />
              </HoverCardTrigger>
              <HoverCardPortal>
                <HoverCardContent
                  side="top"
                  :side-offset="8"
                  as-child
                >
                  <motion.div
                    class="bg-white rounded-lg shadow-lg p-2 min-w-32 max-w-xs"
                    :initial="{ opacity: 0, y: 10 }"
                    :animate="{ opacity: 1, y: 0 }"
                    :exit="{ opacity: 0, y: 10 }"
                    :transition="{ duration: 0.2 }"
                  >
                    <div class="text-sm font-medium">
                      {{ photo.title || `照片 ${photo.id}` }}
                    </div>
                    <div class="text-xs text-gray-600">
                      {{ photo.city || photo.country || '未知位置' }}
                    </div>
                  </motion.div>
                </HoverCardContent>
              </HoverCardPortal>
            </HoverCardRoot>
          </template>
        </MapboxDefaultMarker>
      </MapboxMap>
    </motion.div>
  </div>
</template>

<style scoped></style>
