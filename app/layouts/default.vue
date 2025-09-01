<script lang="ts" setup>
useHead({
  title: 'Gallery',
  titleTemplate: (title) => `${title} - TimoYin's mems`,
})

const { data } = useFetch('/api/photos')
const photos = computed(() => (data.value as Photo[]) || [])
</script>

<template>
  <div class="relative h-screen">
    <div class="h-svh px-1">
      <ClientOnly>
        <MasonryRoot
          :photos="photos"
          columns="auto"
        />
        <slot />
        <template #fallback>
          <div
            class="fixed inset-0 flex flex-col gap-4 items-center justify-center"
          >
            <LoaderAvatar />
            <span class="loading-scan-wrapper">
              <span class="text-base font-medium loading-scan-text"
                >LOADING</span
              >
            </span>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped></style>
