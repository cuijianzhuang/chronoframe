<script lang="ts" setup>
const { data } = useFetch('/api/photos')
</script>

<template>
  <div class="h-svh p-2 pt-1 bg-gray-50 dark:bg-gray-900">
    <MasonryRoot
      :photos="data as Photo[]"
      :columns="'auto'"
    />
  </div>
</template>
