<script lang="ts" setup>
import avatarImage from '~/assets/images/avatar.webp'

defineProps<{
  stats?: {
    total: number
    dateRange: {
      start: string | undefined
      end: string | undefined
    } | null
  }
  dateRangeText?: string
}>()

const handleOpenLogin = () => {
  window.location.href = '/api/auth/github'
  console.log('Login button clicked')
}
</script>

<template>
  <div
    class="inline-block w-full align-top break-inside-avoid mb-[4px] relative overflow-hidden"
  >
    <div
      class="absolute inset-0 -z-10 blur-3xl scale-110 bg-cover bg-center opacity-35"
      :style="{
        backgroundImage: `url(${avatarImage})`,
      }"
    ></div>
    <div
      class="absolute inset-0 -z-10 bg-white/50 dark:bg-neutral-900/50"
    ></div>
    <div class="flex flex-col items-center py-6 gap-2">
      <AuthState>
        <template #default="{ loggedIn, user, clear }">
          <div class="flex flex-col items-center gap-2">
            <div class="relative mx-auto">
              <div
                v-if="loggedIn"
                class="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white rounded-full flex items-center justify-center size-5 text-xs drop-shadow-lg drop-shadow-amber-500/30"
              >
                <Icon name="tabler:star-filled" />
              </div>
              <img
                :src="avatarImage"
                class="size-12 rounded-full object-cover"
                :class="!loggedIn && 'cursor-pointer'"
                alt="Timothy's Avatar"
                @click="!loggedIn && handleOpenLogin()"
              />
            </div>
            <h1
              class="text-2xl font-bold text-neutral-900 dark:text-white/90 mb-2"
            >
              TimoYin's mems
            </h1>
          </div>
          <div
            class="text-neutral-600 dark:text-white/30 space-y-1 text-center"
          >
            <p class="text-xs font-medium">
              <span v-if="dateRangeText">{{ dateRangeText }}, 共</span>
              {{ stats?.total }} 张照片
            </p>
            <p class="font-[Pacifico]">Mems rest within the lens.</p>
          </div>
          <div
            class="text-center mt-3"
            v-if="loggedIn"
          >
            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                color="info"
                variant="soft"
                icon="tabler:dashboard"
                to="/dashboard"
              >
                仪表盘
              </UButton>
              <UButton
                size="sm"
                color="error"
                variant="soft"
                icon="tabler:logout"
                @click="clear"
              >
                登出
              </UButton>
            </div>
          </div>
        </template>
      </AuthState>
    </div>
  </div>
</template>

<style scoped></style>
