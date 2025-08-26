<script lang="ts" setup>
defineProps<{
  stats?: {
    total: number
    withDates: number
    withTitles: number
    withExif: number
    dateRange: {
      start: Date | undefined
      end: Date | undefined
    } | null
  }
  dateRangeText?: string
}>()
</script>

<template>
  <div
    class="inline-block w-full align-top break-inside-avoid mb-4 select-auto"
  >
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Photo Gallery
      </h1>
      <div class="text-gray-600 dark:text-gray-400 space-y-1">
        <p class="text-lg">{{ stats?.total }} 张照片</p>
        <div class="text-sm space-y-1">
          <p v-if="dateRangeText">时间跨度: {{ dateRangeText }}</p>
          <p>
            {{ stats?.withDates }} 张包含拍摄时间 ·
            {{ stats?.withExif }} 张包含 EXIF 数据
          </p>
        </div>
      </div>
      <AuthState>
        <template #default="{ loggedIn, user, clear }">
          <div
            v-if="loggedIn"
            class="text-gray-600 dark:text-gray-400 flex flex-col items-center"
          >
            Logged in as {{ user?.username || user?.email }}
            <div class="gap-3">
              <NuxtLink
                to="/dashboard"
                class="ml-2 text-blue-500"
              >
                Dashboard
              </NuxtLink>
              <button
                @click="clear"
                class="ml-2 text-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
          <div v-else>
            <a
              href="/api/auth/github"
              class="text-blue-500"
            >
              Login
            </a>
          </div>
        </template>
        <template #placeholder>
          <button disabled>Loading...</button>
        </template>
      </AuthState>
    </div>
  </div>
</template>

<style scoped></style>
