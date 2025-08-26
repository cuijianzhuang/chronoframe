import type { LoadingIndicatorRef } from '~/components/photo/LoadingIndicator.vue'
import { LoadingState } from '@chronoframe/webgl-image'

export const useWebGLWorkState = (
  loadingIndicatorRef: LoadingIndicatorRef | null,
) => {
  return (
    isLoading: boolean,
    state?: LoadingState,
    quality?: 'high' | 'medium' | 'low' | 'unknown',
  ) => {
    let message = ''

    if (state === LoadingState.TEXTURE_LOADING) {
      message = '正在创建纹理'
    } else if (state === LoadingState.IMAGE_LOADING) {
      message = '正在加载图像'
    }

    loadingIndicatorRef?.updateLoadingState({
      isVisible: isLoading,
      isWebGLLoading: isLoading,
      webglMessage: message,
      webglQuality: quality,
    })
  }
}
