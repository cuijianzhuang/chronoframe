<script setup lang="ts">
useHead({
  titleTemplate: (title) => `${title} - TimoYin's mems`,
})

const { data } = useFetch('/api/photos')
const photos = computed(() => (data.value as Photo[]) || [])
</script>

<template>
  <UApp>
    <PhotosProvider :photos="photos">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </PhotosProvider>
  </UApp>
</template>

<style></style>
