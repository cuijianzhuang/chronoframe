<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Dashboard',
    icon: 'tabler:dashboard',
    to: '/dashboard',
  },
  {
    label: 'Photos',
    icon: 'tabler:photo-cog',
    to: '/dashboard/photos',
  },
])
</script>

<template>
  <header class="w-full px-4 border-b border-default flex items-center gap-4">
    <div class="flex items-center gap-2">
      <Icon
        name="tabler:photo-circle"
        class="size-6 text-primary"
      />
      <h1 class="text-lg font-medium text-nowrap">Timothy Yin's Photos</h1>
    </div>
    <UNavigationMenu
      variant="pill"
      :items="items"
      :ui="{
        viewportWrapper: 'max-w-5xl',
      }"
      class="w-full"
    />
  </header>
  <main>
    <NuxtPage />
  </main>
</template>

<style scoped></style>
