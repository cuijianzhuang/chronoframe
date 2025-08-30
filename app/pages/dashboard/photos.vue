<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Photo } from '~~/server/utils/db'

definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Photos',
})

const dayjs = useDayjs()

const { data, status, refresh } = useFetch('/api/photos')

// 当前上传的文件信息
interface UploadingFile {
  file: File
  fileName: string
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
  progress?: number
  error?: string
  signedUrlResponse?: { signedUrl: string; fileKey: string; expiresIn: number }
  // 添加详细进度信息
  uploadProgress?: {
    loaded: number
    total: number
    percentage: number
    speed?: number
    timeRemaining?: number
    speedText?: string
    timeRemainingText?: string
  }
  // 添加上传管理器的关键方法
  canAbort?: boolean
  abortUpload?: () => void
}

const uploadingFiles = ref<Map<string, UploadingFile>>(new Map())

// 使用预签名 URL 上传文件函数
const uploadImage = async (file: File) => {
  const fileName = file.name
  const fileId = `${Date.now()}-${fileName}`

  // 为每个文件创建独立的上传管理器
  const uploadManager = useUpload({
    timeout: 10 * 60 * 1000, // 10分钟超时
  })

  // 添加到上传队列
  const uploadingFile: UploadingFile = {
    file,
    fileName,
    status: 'preparing',
    canAbort: false,
    abortUpload: () => uploadManager.abortUpload(),
  }
  uploadingFiles.value.set(fileId, uploadingFile)

  try {
    // 第一步：获取预签名 URL
    uploadingFile.status = 'preparing'
    const signedUrlResponse = (await $fetch('/api/photos', {
      method: 'POST',
      body: {
        fileName: file.name,
        contentType: file.type,
      },
    })) as { signedUrl: string; fileKey: string; expiresIn: number }

    uploadingFile.signedUrlResponse = signedUrlResponse
    uploadingFile.status = 'uploading'
    uploadingFile.canAbort = true

    // 第二步：使用 composable 上传文件到 S3
    await uploadManager.uploadFile(file, signedUrlResponse.signedUrl, {
      onProgress: (progress: UploadProgress) => {
        // 更新文件特定的进度信息
        console.log(`文件 ${fileName} 上传进度:`, progress.percentage + '%')
        uploadingFile.progress = progress.percentage
        uploadingFile.uploadProgress = {
          loaded: progress.loaded,
          total: progress.total,
          percentage: progress.percentage,
          speed: progress.speed,
          timeRemaining: progress.timeRemaining,
          speedText: progress.speed ? `${formatBytes(progress.speed)}/s` : '',
          timeRemainingText: progress.timeRemaining
            ? dayjs.duration(progress.timeRemaining, 'seconds').humanize()
            : '',
        }

        // 触发响应式更新
        uploadingFiles.value = new Map(uploadingFiles.value)
      },
      onStatusChange: (status: string) => {
        console.log(`文件 ${fileName} 上传状态变更:`, status)
        // 根据状态更新 canAbort
        uploadingFile.canAbort = status === 'uploading'
        uploadingFiles.value = new Map(uploadingFiles.value)
      },
      onSuccess: async (xhr: XMLHttpRequest) => {
        console.log(`文件 ${fileName} 上传成功`, xhr.status)

        // 第三步：通知服务器开始处理照片
        uploadingFile.status = 'processing'
        uploadingFile.canAbort = false
        uploadingFiles.value = new Map(uploadingFiles.value)

        try {
          await $fetch('/api/photos/process', {
            method: 'POST' as any,
            body: {
              fileKey: signedUrlResponse.fileKey,
              fileName: file.name,
              fileSize: file.size,
            },
          })

          uploadingFile.status = 'completed'
          uploadingFile.canAbort = false
          uploadingFiles.value = new Map(uploadingFiles.value)

          // 开始状态检查
          if (!statusInterval) {
            statusInterval = setInterval(checkProcessingStatus, 2000)
          }
        } catch (processError: any) {
          uploadingFile.status = 'error'
          uploadingFile.error = `处理失败: ${processError.message}`
          uploadingFile.canAbort = false
          uploadingFiles.value = new Map(uploadingFiles.value)
          throw processError
        }
      },
      onError: (error: string) => {
        uploadingFile.status = 'error'
        uploadingFile.error = error
        uploadingFile.canAbort = false
        uploadingFiles.value = new Map(uploadingFiles.value)
        console.error(`文件 ${fileName} 上传失败:`, error)
      },
    })
  } catch (error: any) {
    uploadingFile.status = 'error'
    uploadingFile.error = error.message || '上传失败'
    uploadingFile.canAbort = false
    uploadingFiles.value = new Map(uploadingFiles.value)

    console.error('上传请求失败:', error)

    // 提供更详细的错误信息
    if (error.response?.status === 401) {
      throw new Error('未授权，请重新登录')
    } else if (error.message?.includes('CORS')) {
      throw new Error('跨域请求失败，请检查存储服务的 CORS 配置')
    } else if (
      error.message?.includes('NetworkError') ||
      error.name === 'TypeError'
    ) {
      throw new Error('网络连接失败或 CORS 错误，请检查网络连接和存储配置')
    } else if (error.message?.includes('上传到存储失败')) {
      throw new Error('文件上传到云存储失败，请重试')
    } else {
      throw new Error(error.message || '上传失败，请重试')
    }
  } finally {
    // 上传完成后从队列中移除（延迟移除以便用户看到结果）
    setTimeout(() => {
      uploadingFiles.value.delete(fileId)
      uploadingFiles.value = new Map(uploadingFiles.value)
    }, 5000)
  }
}

// 处理状态
const processingFiles = ref<Set<string>>(new Set())
const toast = useToast()
const selectedFiles = ref<File[]>([])

// 状态检查间隔
let statusInterval: NodeJS.Timeout | null = null

const columns: TableColumn<Photo>[] = [
  {
    accessorKey: 'id',
    header: 'Photo ID',
  },
  {
    accessorKey: 'title',
    header: '照片标题',
  },
  {
    accessorKey: 'lastModified',
    header: '最后修改',
  },
  {
    accessorKey: 'fileSize',
    header: '文件大小',
    cell: (info) => formatBytes(info.getValue() as number),
  },
  {
    accessorKey: 'actions',
    header: '操作',
  },
]

const checkProcessingStatus = async () => {
  if (processingFiles.value.size === 0) {
    // 如果没有文件在处理，停止检查
    if (statusInterval) {
      clearInterval(statusInterval)
      statusInterval = null
    }
    return
  }

  try {
    const response = await $fetch('/api/photos/status')
    const currentPhotoCount = data.value?.length || 0

    // 简单检查：如果照片数量增加了，说明有照片处理完成
    if (response.recentPhotos?.length > currentPhotoCount) {
      // 刷新照片列表
      await refresh()

      // 清空处理中的文件列表
      processingFiles.value.clear()

      // 停止状态检查
      if (statusInterval) {
        clearInterval(statusInterval)
        statusInterval = null
      }

      toast.add({
        title: '照片处理完成',
        description: '您的照片已成功处理并上传',
        color: 'success',
      })
    }
  } catch (error) {
    console.error('检查状态失败:', error)
    // 不显示错误给用户，避免频繁弹窗
  }
}

// 文件验证函数
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // 检查文件类型
  // const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
  // if (!allowedTypes.includes(file.type)) {
  //   return {
  //     valid: false,
  //     error: `不支持的文件格式: ${file.type}。请选择 JPEG、PNG 或 HEIC 格式的图片。`
  //   }
  // }

  // 检查文件大小 (128MB 限制)
  const maxSize = 128 * 1024 * 1024 // 128MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件太大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持 128MB。`,
    }
  }

  return { valid: true }
}

const handleUpload = async () => {
  const fileList = selectedFiles.value

  if (fileList.length === 0) {
    return
  }

  for (const file of fileList) {
    // 验证文件
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.add({
        title: '文件验证失败',
        description: validation.error,
        color: 'error',
      })
      continue
    }

    const fileName = file.name
    processingFiles.value.add(fileName)

    toast.add({
      title: '开始上传照片',
      description: `正在上传 ${fileName} 到云存储...`,
      color: 'info',
    })

    try {
      await uploadImage(file)

      toast.add({
        title: '照片上传成功',
        description: `${fileName} 已上传，正在后台处理...`,
        color: 'success',
      })

      // 开始状态检查
      if (!statusInterval) {
        statusInterval = setInterval(checkProcessingStatus, 2000)
      }
    } catch (error: any) {
      processingFiles.value.delete(fileName)
      toast.add({
        title: '上传失败',
        description: `${fileName}: ${error.message}`,
        color: 'error',
      })
      console.error('上传错误:', error)
    }
  }

  // 清空选中的文件
  selectedFiles.value = []
}

const handleDelete = async (photoId: string) => {
  await $fetch(`/api/photos/${photoId}`, {
    method: 'DELETE',
  })
  refresh()
}

// 清理定时器
onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})
</script>

<template>
  <div class="flex flex-col gap-4 h-full p-4">
    <!-- 上传进度显示 -->
    <div
      v-if="uploadingFiles.size > 0"
      class="space-y-3"
    >
      <h3 class="text-lg font-semibold">上传进度</h3>
      <div class="space-y-2">
        <div
          v-for="[fileId, uploadingFile] of uploadingFiles"
          :key="fileId"
          class="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium">{{ uploadingFile.fileName }}</span>
            <div class="flex items-center gap-2">
              <!-- 状态指示器 -->
              <UBadge
                :color="
                  uploadingFile.status === 'completed'
                    ? 'success'
                    : uploadingFile.status === 'error'
                      ? 'error'
                      : uploadingFile.status === 'processing'
                        ? 'info'
                        : 'warning'
                "
                variant="soft"
              >
                {{
                  uploadingFile.status === 'preparing'
                    ? '准备中'
                    : uploadingFile.status === 'uploading'
                      ? '上传中'
                      : uploadingFile.status === 'processing'
                        ? '处理中'
                        : uploadingFile.status === 'completed'
                          ? '完成'
                          : '错误'
                }}
              </UBadge>

              <!-- 中止按钮 -->
              <UButton
                v-if="
                  uploadingFile.status === 'uploading' && uploadingFile.canAbort
                "
                size="xs"
                color="error"
                variant="soft"
                icon="tabler:file-x"
                @click="uploadingFile.abortUpload?.()"
              >
                中止上传
              </UButton>
            </div>
          </div>

          <!-- 进度条 -->
          <div
            v-if="
              uploadingFile.status === 'uploading' &&
              uploadingFile.progress !== undefined
            "
            class="mb-2"
          >
            <div
              class="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1"
            >
              <span>{{ uploadingFile.progress }}%</span>
              <span v-if="uploadingFile.uploadProgress?.speedText">
                {{ uploadingFile.uploadProgress.speedText }}
              </span>
            </div>
            <UProgress
              :model-value="uploadingFile.progress"
              class="h-2"
            />
            <div
              v-if="uploadingFile.uploadProgress?.timeRemainingText"
              class="text-xs text-neutral-500 mt-1"
            >
              ETA: {{ uploadingFile.uploadProgress.timeRemainingText }}
            </div>
          </div>

          <!-- 错误信息 -->
          <UAlert
            v-if="uploadingFile.status === 'error' && uploadingFile.error"
            :description="uploadingFile.error"
            color="error"
            variant="soft"
            class="mt-2"
          />
        </div>
      </div>
    </div>

    <!-- 文件上传组件 -->
    <div class="relative">
      <UFileUpload
        v-model="selectedFiles"
        label="选择照片"
        description="支持 JPEG、PNG、HEIC 格式，最大 256MB"
        layout="list"
        size="xl"
        accept="image/jpeg,image/png,image/heic,image/heif"
        multiple
      />
      <UButton
        class="absolute top-3.5 right-3.5"
        variant="soft"
        size="lg"
        icon="tabler:upload"
        :disabled="selectedFiles.length === 0"
        @click="handleUpload"
      >
        上传照片
      </UButton>
    </div>

    <!-- 照片列表 -->
    <div
      class="border border-neutral-300 dark:border-neutral-800 rounded overflow-hidden"
    >
      <UTable
        :data="data as Photo[]"
        :columns="columns"
        :loading="status === 'pending'"
        sticky
        class="h-[600px]"
        :ui="{
          separator:
            'bg-(--ui-color-neutral-200) dark:bg-(--ui-color-neutral-700)',
        }"
      >
        <template #actions-cell="{ row }">
          <UButton
            size="sm"
            variant="soft"
            color="error"
            @click="handleDelete(row.original.id)"
          >
            删除
          </UButton>
        </template>
      </UTable>
    </div>
  </div>
</template>

<style scoped></style>
