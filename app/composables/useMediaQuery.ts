import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 媒体查询 composable
 * @param query CSS 媒体查询字符串
 * @returns 是否匹配媒体查询的响应式引用
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | null = null

  const updateMatches = () => {
    if (mediaQuery) {
      matches.value = mediaQuery.matches
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches
      
      // 监听媒体查询变化
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateMatches)
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener(updateMatches)
      }
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches)
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener(updateMatches)
      }
    }
  })

  return matches
}
