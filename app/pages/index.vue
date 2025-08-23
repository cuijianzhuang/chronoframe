<script lang="ts" setup>
const { data } = useFetch('/api/photos')

// Transform data to match the expected photo format
const photos = computed(() => {
  if (!data.value?.urls) return []

  return [...data.value.urls].map((url: string, index: number) => ({
    id: `photo-${index}`,
    url,
    title: `Photo ${index + 1}`,
    date: new Date(2024, index + 1, index + 1), // Mock dates for demo
  }))
})
</script>

<template>
  <div class="min-h-screen p-2 pt-1 bg-gray-50 dark:bg-gray-900">
    <MasonryRoot
      :photos="photos"
      :columns="'auto'"
    />
  </div>
</template>
