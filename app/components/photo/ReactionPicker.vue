<script setup lang="ts">
import { motion, AnimatePresence } from 'motion-v'

interface Reaction {
  id: string
  iconName: string
  label: string
  count?: number
}

interface Props {
  isOpen: boolean
  selectedReaction?: string | null
  reactionCounts?: Record<string, number>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
  close: []
}>()

// 可用的表态选项
const reactions = computed<Reaction[]>(() => [
  { id: 'like', iconName: 'fluent-emoji-flat:thumbs-up', label: 'like', count: props.reactionCounts?.like || 0 },
  { id: 'love', iconName: 'fluent-emoji-flat:red-heart', label: 'love', count: props.reactionCounts?.love || 0 },
  { id: 'amazing', iconName: 'fluent-emoji-flat:smiling-face-with-heart-eyes', label: 'amazing', count: props.reactionCounts?.amazing || 0 },
  { id: 'funny', iconName: 'fluent-emoji-flat:face-with-tears-of-joy', label: 'funny', count: props.reactionCounts?.funny || 0 },
  { id: 'wow', iconName: 'fluent-emoji-flat:face-with-open-mouth', label: 'wow', count: props.reactionCounts?.wow || 0 },
  { id: 'sad', iconName: 'fluent-emoji-flat:crying-face', label: 'sad', count: props.reactionCounts?.sad || 0 },
  { id: 'fire', iconName: 'fluent-emoji-flat:fire', label: 'fire', count: props.reactionCounts?.fire || 0 },
  { id: 'sparkle', iconName: 'fluent-emoji-flat:sparkles', label: 'sparkle', count: props.reactionCounts?.sparkle || 0 },
])

// 格式化数量显示
const formatCount = (count?: number): string => {
  if (!count || count === 0) return ''
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

const handleSelect = (id: string) => {
  emit('select', id)
}
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="isOpen"
      :initial="{ opacity: 0, scale: 0.9, y: 10 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :exit="{ opacity: 0, scale: 0.9, y: 10 }"
      :transition="{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }"
      class="absolute bottom-full right-0 mb-2 z-30"
      @click.stop
    >
      <div 
        class="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30 p-3"
      >
        <!-- 表态网格 -->
        <div class="grid grid-cols-4 gap-2 min-w-[220px]">
          <motion.button
            v-for="reaction in reactions"
            :key="reaction.id"
            type="button"
            :initial="{ scale: 0, opacity: 0 }"
            :animate="{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: 'spring', 
                stiffness: 500, 
                damping: 20,
                delay: reactions.indexOf(reaction) * 0.03
              }
            }"
            :while-hover="{ 
              scale: 1.2,
              transition: { 
                type: 'spring', 
                stiffness: 500, 
                damping: 20
              }
            }"
            :while-tap="{ 
              scale: 0.9,
              transition: { 
                type: 'spring', 
                stiffness: 500, 
                damping: 20
              }
            }"
            :class="[
              'relative aspect-square w-full min-w-[48px] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 group',
              'hover:bg-neutral-100/80 dark:hover:bg-white/10',
              'active:bg-neutral-200/80 dark:active:bg-white/20',
              selectedReaction === reaction.id 
                ? 'bg-blue-100 dark:bg-blue-500/20 ring-2 ring-blue-500/50' 
                : 'bg-transparent'
            ]"
            :title="reaction.label"
            @click="handleSelect(reaction.id)"
          >
            <Icon 
              :name="reaction.iconName" 
              class="text-[28px] select-none"
            />
            
            <!-- 数量徽章 - 右上角 -->
            <motion.span 
              v-if="reaction.count !== undefined && reaction.count > 0"
              :initial="{ scale: 0, opacity: 0 }"
              :animate="{ scale: 1, opacity: 1 }"
              :class="[
                'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1',
                'flex items-center justify-center',
                'text-[9px] font-bold leading-none',
                'rounded-full',
                'shadow-sm',
                selectedReaction === reaction.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 text-neutral-700 dark:text-neutral-100',
                'border border-white/50 dark:border-neutral-800/50',
                'group-hover:scale-110 transition-transform duration-150'
              ]"
            >
              {{ formatCount(reaction.count) }}
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
