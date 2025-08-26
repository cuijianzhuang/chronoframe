<script lang="ts" setup>
const { data } = useFetch('/api/photos')
</script>

<template>
  <div class="h-svh p-2 pt-1 bg-gray-50 dark:bg-gray-900">
    <ClientOnly>
      <MasonryRoot
        :photos="data as Photo[]"
        :columns="'auto'"
      />
    </ClientOnly>
  </div>
</template>
