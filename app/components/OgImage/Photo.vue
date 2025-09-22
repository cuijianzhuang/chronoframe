<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    photo?: Photo
    title?: string
    description?: string
    headline?: string
    thumbnailJpegUrl?: string
  }>(),
  {
    title: 'title',
    description: '',
    headline: 'headline',
    class: '',
  },
)

const title = computed(() => (props.title || '').slice(0, 60))
const description = computed(() => (props.description || '').slice(0, 200))
</script>

<template>
  <div
    :class="'w-full h-full flex flex-col justify-center bg-neutral-950 relative'"
  >
    <img
      v-if="thumbnailJpegUrl"
      :src="thumbnailJpegUrl"
      class="absolute inset-y-0 right-0 object-cover"
      width="60%"
      height="100%"
    />
    <div
      v-if="thumbnailJpegUrl"
      class="absolute inset-y-0 right-0 w-[60%]"
      :style="{
        background:
          'linear-gradient(90deg, rgba(10,10,10,1) 0%, rgba(10,10,10,0.3) 35%, rgba(10,10,10,0.1) 100%)',
      }"
    />
    <div class="h-full flex flex-col justify-center pl-24 bg-neutral-950/10">
      <p
        v-if="headline"
        class="uppercase text-2xl text-rose-500 mb-4 font-semibold"
      >
        {{ headline }}
      </p>
      <h1
        v-if="title"
        class="m-0 text-7xl font-bold mb-4 text-white"
        style="display: block; line-clamp: 2; text-overflow: ellipsis"
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-lg text-neutral-300 font-medium leading-tight"
        style="display: block; line-clamp: 3; text-overflow: ellipsis"
      >
        {{ description }}
      </p>
      <div
        v-if="photo"
        class="flex flex-row items-center gap-3 text-neutral-300 text-base font-bold"
      >
        <div
          v-if="photo.city"
          class="flex flex-row items-center gap-1"
        >
          <Icon
            name="tabler:map-pin"
            class="size-6"
            mode="svg"
          />
          <span class="truncate">
            {{ photo.city }}
          </span>
        </div>
        <div
          v-if="photo.exif?.Model"
          class="flex flex-row items-center gap-1"
        >
          <Icon
            name="tabler:camera"
            class="size-6"
            mode="svg"
          />
          <span class="truncate">
            {{ photo.exif?.Model }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
