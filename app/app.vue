<script setup lang="ts">
useHead({
  titleTemplate: (title) => `${title} - TimoYin's mems`,
})

const { data } = useFetch('/api/photos')
const photos = computed(() => (data.value as Photo[]) || [])

// 在全局级别提供筛选功能的状态管理
provide('photosFiltering', reactive({
  activeFilters: {
    tags: [],
    cameras: [],
    lenses: [],
    cities: [],
    ratings: []
  }
}))
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
