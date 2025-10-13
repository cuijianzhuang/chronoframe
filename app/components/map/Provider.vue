<script lang="ts" setup>
import type { StyleSpecification } from 'maplibre-gl'
import { twMerge } from 'tailwind-merge'
import MaplibreBasicStyle from '~/assets/mapStyles/maplibre_basic.json'

defineProps<{
  class?: string
}>()

const emit = defineEmits<{
  load: [map: any]
}>()

const mapConfig = useRuntimeConfig().public.map

const provider = computed(() => mapConfig.provider)
const mapStyle = computed(() => {
  if (provider.value === 'mapbox') {
    return `mapbox://styles/mapbox/standard`
  } else {
    return MaplibreBasicStyle as StyleSpecification
  }
})
</script>

<template>
  <div :class="twMerge('w-full h-full', $props.class)">
    <ClientOnly>
      <MglMap
        v-if="provider === 'maplibre'"
        :map-style="mapStyle"
        @map:load="emit('load', $event.map)"
      >
        <slot />
      </MglMap>
      <MapboxMap
        v-else
        :options="{
          style: mapStyle,
        }"
        @load="emit('load', $event)"
      >
        <slot />
      </MapboxMap>
    </ClientOnly>
  </div>
</template>

<style scoped></style>
