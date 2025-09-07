<script lang="ts" setup>
import { motion } from 'motion-v'
import ThumbImage from '../ThumbImage.vue'
import { twMerge } from 'tailwind-merge'

withDefaults(
  defineProps<{
    photo: Photo
    isSelected?: boolean
  }>(),
  {
    isSelected: false,
  },
)

const emit = defineEmits<{
  click: [photo: Photo]
  close: []
}>()

const dayjs = useDayjs()

const onClick = (photo: Photo) => {
  emit('click', photo)
}
</script>

<template>
  <MapboxDefaultMarker
    :key="photo.id"
    :marker-id="`photo-${photo.id}`"
    :lnglat="[photo.longitude, photo.latitude]"
    :options="{}"
  >
    <template #marker>
      <HoverCardRoot
        :open="isSelected || undefined"
        :open-delay="isSelected ? 0 : 600"
        :close-delay="isSelected ? Number.MAX_SAFE_INTEGER : 100"
        @close="$event.preventDefault()"
      >
        <HoverCardTrigger as-child>
          <motion.div
            class="relative group cursor-pointer"
            :initial="{ opacity: 0, scale: 0 }"
            :animate="{ opacity: 1, scale: 1 }"
            :while-hover="{ scale: 1.1 }"
            :while-press="{ scale: 0.95 }"
            :transition="{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }"
            @click="onClick(photo)"
          >
            <div
              v-if="isSelected"
              class="bg-primary/30 absolute -inset-1 animate-pulse rounded-full"
            />

            <div class="absolute inset-0 overflow-hidden rounded-full">
              <ThumbImage
                :src="photo.thumbnailUrl!"
                :alt="photo.title || `照片 ${photo.id}`"
                :thumbhash="photo.thumbnailHash"
                :threshold="0.1"
                root-margin="100px"
                class="h-full w-full object-cover opacity-40"
              />
              <div
                class="from-green/60 to-emerald/80 dark:from-green/70 dark:to-emerald/90 absolute inset-0 bg-gradient-to-br"
              />
            </div>

            <!-- main -->
            <div
              :class="
                twMerge(
                  'relative size-10 flex justify-center items-center rounded-full border shadow-lg hover:shadow-xl backdrop-blur-md',
                  isSelected
                    ? 'border-primary/40 bg-primary/90 shadow-primary/50 dark:border-primary/30 dark:bg-primary/80'
                    : 'border-white/40 bg-white/95 hover:bg-white dark:border-white/20 dark:bg-black/80 dark:hover:bg-black/90',
                )
              "
            >
              <div
                class="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-white/10 dark:from-white/20 dark:to-white/5"
              />
              <Icon
                name="tabler:photo"
                class="size-5 text-white drop-shadow"
              />
              <div
                class="absolute inset-0 rounded-full shadow-inner shadow-black/5"
              />
            </div>
          </motion.div>
        </HoverCardTrigger>
        <HoverCardPortal>
          <AnimatePresence>
            <HoverCardContent
              as-child
              side="top"
              align="center"
              :side-offset="8"
              @pointer-down-outside="
                isSelected ? $event.preventDefault() : undefined
              "
              @escape-key-down="
                isSelected ? $event.preventDefault() : undefined
              "
              @focus-outside="isSelected ? $event.preventDefault() : undefined"
              @interact-outside="
                isSelected ? $event.preventDefault() : undefined
              "
            >
              <motion.div
                class="bg-black/50 backdrop-blur-md border border-neutral-700 rounded-lg shadow-lg w-xs max-w-xs overflow-hidden relative"
                :initial="{ opacity: 0, scale: 0.95, y: 4 }"
                :animate="{ opacity: 1, scale: 1, y: 0 }"
                :exit="{ opacity: 0, scale: 0.95, y: 4 }"
                :transition="{ duration: 0.2 }"
              >
                <MapGlassButton
                  v-if="isSelected"
                  class="absolute top-2 right-2 z-10 size-8"
                  @click="$emit('close')"
                >
                  <Icon
                    name="tabler:x"
                    class="size-5"
                  />
                </MapGlassButton>
                <div class="relative h-36 overflow-hidden">
                  <ThumbImage
                    :src="photo.thumbnailUrl!"
                    :alt="photo.title || `照片 ${photo.id}`"
                    :thumbhash="photo.thumbnailHash"
                    :threshold="0.1"
                    root-margin="200px"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="relative px-3 py-2 space-y-1">
                  <!-- Header -->
                  <NuxtLink
                    :to="`/${photo.id}`"
                    target="_blank"
                    rel="noopener"
                    class="flex items-center gap-2 text-white group/link"
                  >
                    <h3 class="flex-1 text-lg font-semibold truncate">
                      {{ photo.title || `照片 ${photo.id}` }}
                    </h3>
                    <Icon
                      name="tabler:external-link"
                      class="size-4 text-muted opacity-0 group-hover/link:opacity-100 transition-opacity"
                    />
                  </NuxtLink>

                  <!-- Metadata -->
                  <div class="space-y-1">
                    <div
                      v-if="photo.city || photo.exif?.DateTimeOriginal"
                      class="flex items-center gap-1 text-xs text-muted font-medium mb-2"
                    >
                      <div v-if="photo.city">
                        <span class="truncate">
                          {{ photo.city }}
                        </span>
                      </div>
                      <span>·</span>
                      <div v-if="photo.exif?.DateTimeOriginal">
                        <span class="truncate">
                          {{
                            dayjs(photo.exif.DateTimeOriginal).format(
                              'YY年MM月DD日',
                            )
                          }}
                        </span>
                      </div>
                    </div>
                    <!-- Camera -->
                    <div
                      v-if="photo.exif?.Make || photo.exif?.Model"
                      class="flex items-center gap-1 text-xs text-muted"
                    >
                      <Icon
                        name="tabler:camera"
                        class="size-4"
                      />
                      <span class="truncate">
                        {{
                          [photo.exif?.Make, photo.exif?.Model]
                            .filter(Boolean)
                            .join(' ')
                        }}
                      </span>
                    </div>
                    <!-- Latlng -->
                    <div
                      v-if="photo.exif?.GPSLatitude || photo.exif?.GPSLongitude"
                      class="flex items-center gap-1 text-xs text-muted"
                    >
                      <Icon
                        name="tabler:map-pin"
                        class="size-4"
                      />
                      <span class="truncate font-mono">
                        {{
                          photo.exif?.GPSLatitude
                            ? `${Math.abs(Number(photo.exif?.GPSLatitude)).toFixed(4)}°${photo.exif?.GPSLatitudeRef}`
                            : '未知'
                        }},
                        {{
                          photo.exif?.GPSLongitude
                            ? `${Math.abs(Number(photo.exif?.GPSLongitude)).toFixed(4)}°${photo.exif?.GPSLongitudeRef}`
                            : '未知'
                        }}
                      </span>
                    </div>
                    <!-- Altitude -->
                    <div
                      v-if="photo.exif?.GPSAltitude"
                      class="flex items-center gap-1 text-xs text-muted"
                    >
                      <Icon
                        name="tabler:mountain"
                        class="size-4"
                      />
                      <span class="truncate font-mono">
                        {{
                          `${photo.exif.GPSAltitudeRef === 'Below Sea Level' ? '-' : ''}${Math.abs(Number(photo.exif.GPSAltitude)).toFixed(1)}m`
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </HoverCardContent>
          </AnimatePresence>
        </HoverCardPortal>
      </HoverCardRoot>
    </template>
  </MapboxDefaultMarker>
</template>

<style scoped></style>
