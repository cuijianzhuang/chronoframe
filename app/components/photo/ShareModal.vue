<script lang="ts" setup>
import { motion, AnimatePresence } from 'motion-v'

interface Props {
  isOpen: boolean
  photo: Photo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const toast = useToast()

const shareUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/${props.photo.id}`
  }
  return ''
})

const shareText = computed(() => {
  const title = props.photo.title || $t('ui.action.share.fallback.photoTitle')
  const description = props.photo.description || ''
  return `${$t('ui.action.share.text.prefix')} ${title}${description ? ' - ' + description : ''}`
})

const shareTextAndUrl = computed(() => {
  return `${shareText.value}\n${shareUrl.value}`
})

// Social media share functions
const shareToTwitter = () => {
  const text = encodeURIComponent(shareText.value)
  const url = encodeURIComponent(shareUrl.value)
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    '_blank',
  )
}

const shareToTelegram = () => {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareText.value)}`,
    '_blank',
  )
}

const shareToWeibo = () => {
  const text = encodeURIComponent(shareText.value)
  const url = encodeURIComponent(shareUrl.value)
  window.open(
    `https://service.weibo.com/share/share.php?url=${url}&title=${text}`,
    '_blank',
  )
}

const shareToFacebook = () => {
  const url = encodeURIComponent(shareUrl.value)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const shareToWhatsApp = () => {
  const text = encodeURIComponent(`${shareText.value}\n${shareUrl.value}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

const shareToLinkedIn = () => {
  const url = encodeURIComponent(shareUrl.value)
  const title = encodeURIComponent(shareText.value)
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
    '_blank',
  )
}

// Copy functions
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareTextAndUrl.value)
    toast.add({
      title: $t('ui.action.share.success.linkCopied'),
      color: 'success',
      icon: 'tabler:check',
      duration: 3000,
    })
  } catch (error) {
    toast.add({
      title: $t('ui.action.share.error.linkCopyFailed'),
      description: (error as Error)?.message || 'Unknown error',
      color: 'error',
      icon: 'tabler:x',
      duration: 3000,
    })
  }
}

// Native share (for mobile devices)
const nativeShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareText.value,
        url: shareUrl.value,
      })
    } catch (error) {
      console.error($t('ui.action.share.error.nativeShareFailed'), error)
    }
  }
}

// Check if native share is available
const canNativeShare = computed(() => {
  return typeof window !== 'undefined' && navigator.share
})

// Social media platforms data
const socialPlatforms = computed(() => [
  {
    name: $t('ui.action.share.platforms.twitter'),
    icon: 'tabler:brand-twitter',
    color: 'text-blue-500',
    action: shareToTwitter,
  },
  {
    name: $t('ui.action.share.platforms.telegram'),
    icon: 'tabler:brand-telegram',
    color: 'text-blue-400',
    action: shareToTelegram,
  },
  {
    name: $t('ui.action.share.platforms.weibo'),
    icon: 'tabler:brand-weibo',
    color: 'text-red-500',
    action: shareToWeibo,
  },
  {
    name: $t('ui.action.share.platforms.facebook'),
    icon: 'tabler:brand-facebook',
    color: 'text-blue-600',
    action: shareToFacebook,
  },
  {
    name: $t('ui.action.share.platforms.whatsapp'),
    icon: 'tabler:brand-whatsapp',
    color: 'text-green-500',
    action: shareToWhatsApp,
  },
  {
    name: $t('ui.action.share.platforms.linkedin'),
    icon: 'tabler:brand-linkedin',
    color: 'text-blue-700',
    action: shareToLinkedIn,
  },
])

// Close modal when clicking outside
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Keyboard shortcuts
defineShortcuts({
  escape: () => {
    emit('close')
  },
})
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="isOpen"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <motion.div
          :initial="{ opacity: 0, scale: 0.95, y: 20 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.95, y: 20 }"
          :transition="{
            type: 'spring',
            duration: 0.3,
            bounce: 0.1,
          }"
          class="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/90 shadow-2xl backdrop-blur-2xl dark:bg-neutral-900/90"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-white/10 p-4"
          >
            <div class="flex items-center gap-2">
              <Icon
                name="tabler:share-3"
                class="size-5 text-neutral-700 dark:text-neutral-300"
              />
              <h3
                class="text-lg font-semibold text-neutral-900 dark:text-white"
              >
                {{ $t('ui.action.share.title') }}
              </h3>
            </div>
            <UButton
              size="sm"
              variant="ghost"
              color="neutral"
              icon="tabler:x"
              @click="emit('close')"
            />
          </div>

          <!-- Content -->
          <div
            v-if="photo"
            class="p-4"
          >
            <!-- Native Share (Mobile) -->
            <div
              v-if="canNativeShare"
              class="mb-4"
            >
              <UButton
                block
                size="lg"
                color="info"
                variant="soft"
                icon="tabler:share-2"
                @click="nativeShare"
              >
                {{ $t('ui.action.share.actions.nativeShare') }}
              </UButton>
            </div>

            <div class="space-y-4">
              <!-- Share URL Display -->
              <div
                class="rounded-lg border border-neutral-200/50 bg-neutral-50/50 p-3 dark:border-neutral-700/50 dark:bg-neutral-800/50"
              >
                <label
                  class="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  {{ $t('ui.action.share.actions.shareUrl') }}
                </label>
                <div class="flex items-center gap-2">
                  <input
                    :value="shareUrl"
                    readonly
                    class="flex-1 truncate bg-transparent text-sm text-neutral-800 dark:text-neutral-200 resize-none"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="tabler:copy"
                    @click="copyLink"
                  />
                </div>
              </div>
              <!-- Social Platforms Grid -->
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="platform in socialPlatforms"
                  :key="platform.name"
                  type="button"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200/50 bg-white/50 p-4 transition-all hover:scale-105 hover:border-neutral-300/50 hover:bg-white/70 dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:hover:border-neutral-600/50 dark:hover:bg-neutral-700/50"
                  @click="platform.action"
                >
                  <Icon
                    :name="platform.icon"
                    class="size-6"
                    :class="platform.color"
                  />
                  <span
                    class="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {{ platform.name }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
/* 确保模态框在最顶层 */
</style>
