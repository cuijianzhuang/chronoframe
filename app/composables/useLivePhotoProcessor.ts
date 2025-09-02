import { ref, computed } from 'vue'

interface LivePhotoProcessingState {
  isProcessing: boolean
  progress: number
  mp4Blob: Blob | null
  error: string | null
}

// 全局存储已转换的实况照片
const processedLivePhotos = ref<Map<string, LivePhotoProcessingState>>(new Map())

export const useLivePhotoProcessor = () => {
  /**
   * 将 MOV 文件转换为 MP4 blob
   * @param movUrl MOV 文件的 URL
   * @param photoId 照片 ID
   */
  const convertMovToMp4 = async (movUrl: string, photoId: string): Promise<Blob | null> => {
    // 如果已经在处理或已经处理完成，直接返回
    const existing = processedLivePhotos.value.get(photoId)
    if (existing) {
      if (existing.mp4Blob) {
        return existing.mp4Blob
      }
      if (existing.isProcessing) {
        // 等待处理完成
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            const current = processedLivePhotos.value.get(photoId)
            if (current && !current.isProcessing) {
              clearInterval(checkInterval)
              resolve(current.mp4Blob)
            }
          }, 100)
        })
      }
    }

    // 初始化处理状态
    const state: LivePhotoProcessingState = {
      isProcessing: true,
      progress: 0,
      mp4Blob: null,
      error: null
    }
    processedLivePhotos.value.set(photoId, state)

    try {
      // 下载 MOV 文件
      state.progress = 10
      processedLivePhotos.value.set(photoId, { ...state })

      const response = await fetch(movUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch MOV file: ${response.statusText}`)
      }

      state.progress = 30
      processedLivePhotos.value.set(photoId, { ...state })

      const movBlob = await response.blob()

      state.progress = 50
      processedLivePhotos.value.set(photoId, { ...state })

      // 使用 FFmpeg.wasm 或者简单的 video 元素进行转换
      // 由于浏览器原生支持 MOV 播放，我们可以先尝试直接使用
      // 如果需要真正的转换，可以集成 FFmpeg.wasm
      
      // 对于现在，我们直接创建一个可播放的 blob URL
      // 大多数现代浏览器都支持 MOV 格式的播放
      const mp4Blob = new Blob([movBlob], { type: 'video/mp4' })

      state.progress = 90
      processedLivePhotos.value.set(photoId, { ...state })

      // 验证视频是否可以播放
      const videoUrl = URL.createObjectURL(mp4Blob)
      const video = document.createElement('video')
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('Video format not supported'))
        video.src = videoUrl
      })

      URL.revokeObjectURL(videoUrl)

      state.isProcessing = false
      state.progress = 100
      state.mp4Blob = mp4Blob
      processedLivePhotos.value.set(photoId, { ...state })

      return mp4Blob
    } catch (error) {
      state.isProcessing = false
      state.error = error instanceof Error ? error.message : 'Unknown error'
      processedLivePhotos.value.set(photoId, { ...state })
      console.error('Failed to convert MOV to MP4:', error)
      return null
    }
  }

  /**
   * 获取照片的处理状态
   */
  const getProcessingState = (photoId: string) => {
    return computed(() => processedLivePhotos.value.get(photoId) || null)
  }

  /**
   * 批量处理视口内的实况照片
   */
  const batchProcessLivePhotos = async (photos: Array<{ id: string; livePhotoVideoUrl?: string | null }>) => {
    const livePhotos = photos.filter(photo => photo.livePhotoVideoUrl)
    
    // 限制并发数量，避免过多请求
    const batchSize = 3
    for (let i = 0; i < livePhotos.length; i += batchSize) {
      const batch = livePhotos.slice(i, i + batchSize)
      await Promise.allSettled(
        batch.map(photo => convertMovToMp4(photo.livePhotoVideoUrl!, photo.id))
      )
    }
  }

  /**
   * 清理已处理的实况照片缓存
   */
  const clearProcessedCache = () => {
    // 释放所有 blob URLs
    processedLivePhotos.value.forEach((state) => {
      if (state.mp4Blob) {
        // 注意：这里不直接 revoke，因为可能还在使用
        // 实际应用中应该有更好的生命周期管理
      }
    })
    processedLivePhotos.value.clear()
  }

  return {
    convertMovToMp4,
    getProcessingState,
    batchProcessLivePhotos,
    clearProcessedCache,
    processedLivePhotos: readonly(processedLivePhotos)
  }
}
