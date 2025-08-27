<script lang="ts" setup></script>

<template>
  <div class="relative size-20">
    <div
      class="absolute inset-0 rounded-full border-3 border-transparent border-x-primary border-y-secondary animate-spin"
    ></div>

    <div class="absolute inset-1 rounded-full overflow-hidden">
      <img
        class="w-full h-full object-cover"
        src="~/assets/images/avatar.webp"
        alt="Loading..."
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
