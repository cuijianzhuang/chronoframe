<script lang="ts" setup>
withDefaults(
  defineProps<{
    markerId?: string
    lnglat?: [number, number]
  }>(),
  {
    markerId: undefined,
    lnglat: undefined,
  },
)

const mapConfig = useRuntimeConfig().public.map

const provider = computed(() => mapConfig.provider)
</script>

<template>
  <MapboxDefaultMarker
    v-if="provider === 'mapbox'"
    :marker-id
    :lnglat
  >
    <template #marker>
      <slot name="marker" />
    </template>
  </MapboxDefaultMarker>
  <MglMarker
    v-else
    :coordinates="lnglat"
  >
    <template #marker>
      <slot name="marker" />
    </template>
  </MglMarker>
</template>

<style scoped></style>
