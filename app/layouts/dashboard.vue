<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[]>([
  {
    label: '仪表盘',
    icon: 'tabler:dashboard',
    to: '/dashboard',
  },
  {
    label: '照片库',
    icon: 'tabler:photo-cog',
    to: '/dashboard/photos',
  },
])

const { loggedIn, user } = useUserSession()

const handleLogin = () => {
  window.location.href = '/api/auth/github'
}
</script>

<template>
  <header
    v-if="loggedIn"
    class="w-full px-4 border-b border-default flex items-center gap-4"
  >
    <div class="flex items-center gap-2">
      <Icon
        name="tabler:photo-circle"
        class="size-6 text-primary"
      />
      <NuxtLink
        to="/"
        class="text-lg font-medium text-nowrap"
      >
        TimoYin's mems
      </NuxtLink>
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
  <main v-if="loggedIn && user?.isAdmin">
    <NuxtPage />
  </main>
  <div
    v-else
    class="h-svh flex flex-col gap-4 items-center justify-center"
  >
    <Icon
      name="tabler:alert-triangle"
      class="size-12 text-primary"
    />
    <p class="text-gray-500">
      {{
        !user?.isAdmin
          ? 'Please login to view dashboard'
          : 'Sorry, you do not have access to this page.'
      }}
    </p>
    <UButton @click="handleLogin">Login with GitHub</UButton>
  </div>
</template>

<style scoped></style>
