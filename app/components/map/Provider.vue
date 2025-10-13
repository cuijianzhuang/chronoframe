<script lang="ts" setup>
import type { AttributionControlOptions, StyleSpecification } from 'maplibre-gl'
import { twMerge } from 'tailwind-merge'
import type { MapboxMap, MapInstance, MaplibreMap } from '~~/shared/types/map'

import ChronoFrameLightStyle from '~/assets/mapStyles/chronoframe_light.json'
import ChronoFrameDarkStyle from '~/assets/mapStyles/chronoframe_dark.json'

const props = withDefaults(
  defineProps<{
    class?: string
    mapId?: string
    style?: StyleSpecification | string
    center?: [number, number]
    zoom?: number
    interactive?: boolean
    attributionControl?: false | AttributionControlOptions
    language?: string
  }>(),
  {
    class: undefined,
    mapId: undefined,
    style: undefined,
    center: undefined,
    zoom: 2,
    interactive: true,
    attributionControl: false,
    language: undefined,
  },
)

const emit = defineEmits<{
  load: [map: MapInstance]
  zoom: []
}>()

const mapConfig = useRuntimeConfig().public.map
const colorMode = useColorMode()

const provider = computed(() => mapConfig.provider)
const mapStyle = computed(() => {
  if (provider.value === 'mapbox') {
    return props.style || `mapbox://styles/mapbox/standard`
  } else {
    return (
      props.style ||
      ((colorMode.value === 'dark'
        ? ChronoFrameDarkStyle
        : ChronoFrameLightStyle) as StyleSpecification)
    )
  }
})
</script>

<template>
  <div :class="twMerge('w-full h-full', $props.class)">
    <ClientOnly>
      <MglMap
        v-if="provider === 'maplibre'"
        class="w-full h-full"
        :map-key="mapId"
        :map-style
        :center
        :zoom
        :interactive
        :attribution-control
        @map:load="emit('load', $event.map as MaplibreMap)"
        @map:zoom="emit('zoom')"
      >
        <slot />
      </MglMap>
      <MapboxMap
        v-else
        class="w-full h-full"
        :map-id="mapId || 'cframe-mapbox-map'"
        :options="{
          style: mapStyle,
          center: center,
          zoom: zoom,
          interactive: interactive,
          attributionControl: attributionControl,
          language: language,
          config: {
            basemap: {
              lightPreset: $colorMode.value === 'dark' ? 'night' : 'day',
              colorThemes: 'faded',
            },
          },
        }"
        @load="emit('load', $event as MapboxMap)"
        @zoom="emit('zoom')"
      >
        <slot />
      </MapboxMap>
    </ClientOnly>
  </div>
</template>

<style scoped></style>
