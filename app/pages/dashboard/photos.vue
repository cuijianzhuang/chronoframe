<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Photo } from '~~/server/utils/db'
import { h, resolveComponent } from 'vue'

const UCheckbox = resolveComponent('UCheckbox')

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

// 表格多选状态 - 使用官方推荐的方式
const rowSelection = ref({})
const table: any = useTemplateRef('table')

// 计算选中的行数
const selectedRowsCount = computed((): number => {
  return table.value?.tableApi?.getFilteredSelectedRowModel().rows.length || 0
})

// 计算总行数
const totalRowsCount = computed((): number => {
  return table.value?.tableApi?.getFilteredRowModel().rows.length || 0
})

// 计算 LivePhoto 统计
const livePhotoStats = computed(() => {
  if (!data.value) return { total: 0, livePhotos: 0, staticPhotos: 0 }
  
  const total = data.value.length
  const livePhotos = data.value.filter((photo: Photo) => photo.isLivePhoto).length
  const staticPhotos = total - livePhotos
  
  return { total, livePhotos, staticPhotos }
})

// 照片过滤器
const photoFilter = ref<'all' | 'livephoto' | 'static'>('all')

// 过滤后的数据
const filteredData = computed(() => {
  if (!data.value) return []
  
  switch (photoFilter.value) {
    case 'livephoto':
      return data.value.filter((photo: Photo) => photo.isLivePhoto)
    case 'static':
      return data.value.filter((photo: Photo) => !photo.isLivePhoto)
    default:
      return data.value
  }
})

// 状态检查间隔
let statusInterval: NodeJS.Timeout | null = null

const columns: TableColumn<Photo>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
  },
  {
    accessorKey: 'id',
    header: 'Photo ID',
  },
  {
    accessorKey: 'title',
    header: '照片标题',
  },
  {
    accessorKey: 'isLivePhoto',
    header: 'Live Photo',
    cell: ({ row }) => {
      const isLivePhoto = row.original.isLivePhoto
      return h('div', { class: 'flex items-center gap-2' }, [
        isLivePhoto 
          ? h('div', { class: 'flex items-center gap-1' }, [
              h('div', { 
                class: 'size-2 bg-blue-500 rounded-full animate-pulse' 
              }),
              h('span', { 
                class: 'text-blue-600 dark:text-blue-400 text-xs font-medium' 
              }, 'Live Photo')
            ])
          : h('span', { 
              class: 'text-gray-400 text-xs' 
            }, '静态照片')
      ])
    },
    sortingFn: (rowA, rowB) => {
      const valueA = rowA.original.isLivePhoto ? 1 : 0
      const valueB = rowB.original.isLivePhoto ? 1 : 0
      return valueB - valueA // LivePhoto 优先排序
    }
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
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/heic', 
    'image/heif',
    'video/quicktime', // MOV 文件
    'video/mp4'        // MP4 文件（备用）
  ]
  
  const isValidImageType = allowedTypes.includes(file.type)
  const isValidVideoExtension = file.name.toLowerCase().endsWith('.mov')
  
  if (!isValidImageType && !isValidVideoExtension) {
    return {
      valid: false,
      error: `不支持的文件格式: ${file.type}。请选择 JPEG、PNG、HEIC 格式的图片或 MOV 格式的 LivePhoto 视频。`
    }
  }

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
    const isVideoFile = fileName.toLowerCase().endsWith('.mov')
    processingFiles.value.add(fileName)

    toast.add({
      title: isVideoFile ? '开始上传 LivePhoto 视频' : '开始上传照片',
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

// LivePhoto 相关操作
const handleViewLivePhoto = async (photoId: string) => {
  try {
    const livePhotoInfo = await $fetch(`/api/photos/${photoId}/livephoto`)
    
    if (livePhotoInfo.isLivePhoto && livePhotoInfo.livePhotoVideoUrl) {
      // 设置模态框数据
      selectedLivePhoto.value = {
        id: livePhotoInfo.id,
        title: livePhotoInfo.title,
        originalUrl: livePhotoInfo.originalUrl || '',
        videoUrl: livePhotoInfo.livePhotoVideoUrl
      }
      isLivePhotoModalOpen.value = true
    } else {
      toast.add({
        title: '不是 LivePhoto',
        description: '该照片不包含 LivePhoto 视频',
        color: 'warning',
      })
    }
  } catch (error) {
    console.error('获取 LivePhoto 信息失败:', error)
    toast.add({
      title: '操作失败',
      description: '无法获取 LivePhoto 信息',
      color: 'error',
    })
  }
}

// LivePhoto 模态框相关状态
const isLivePhotoModalOpen = ref(false)
const selectedLivePhoto = ref<{
  id: string
  title: string | null
  originalUrl: string
  videoUrl: string
} | null>(null)

// 打开链接的辅助函数
const openInNewTab = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

const handleUpdateLivePhoto = async (photoId: string) => {
  try {
    const updateToast = toast.add({
      title: '正在检查 LivePhoto',
      description: '正在检查是否有对应的视频文件...',
      color: 'info',
    })

    const result = await $fetch('/api/photos/livephoto-manage', {
      method: 'POST',
      body: {
        action: 'update-photo',
        photoId: photoId,
      },
    }) as any

    const isSuccess = 'success' in result && result.success
    
    toast.update(updateToast.id, {
      title: isSuccess ? 'LivePhoto 更新成功' : 'LivePhoto 更新失败',
      description: result.message,
      color: isSuccess ? 'success' : 'warning',
    })

    if (isSuccess) {
      await refresh()
    }
  } catch (error: any) {
    console.error('LivePhoto 更新失败:', error)
    toast.add({
      title: 'LivePhoto 更新失败',
      description: error.message || '更新过程中发生错误',
      color: 'error',
    })
  }
}

// 批量删除功能
const handleBatchDelete = async () => {
  const selectedRowModel = table.value?.tableApi?.getFilteredSelectedRowModel()
  const selectedPhotos =
    selectedRowModel?.rows.map((row: any) => row.original) || []

  if (selectedPhotos.length === 0) {
    toast.add({
      title: '请选择照片',
      description: '请至少选择一张照片进行删除',
      color: 'warning',
    })
    return
  }

  try {
    // 并发删除所有选中的照片
    const deleteToast = toast.add({
      title: '正在删除照片',
      description: `正在删除 ${selectedPhotos.length} 张照片...`,
      color: 'info',
    })
    await Promise.all(
      selectedPhotos.map((photo: any) =>
        $fetch(`/api/photos/${photo.id}`, {
          method: 'DELETE',
        }),
      ),
    )

    toast.update(deleteToast.id, {
      title: '批量删除成功',
      description: `已成功删除 ${selectedPhotos.length} 张照片`,
      color: 'success',
    })

    // 清空选中状态
    rowSelection.value = {}

    // 刷新列表
    refresh()
  } catch (error: any) {
    toast.add({
      title: '批量删除失败',
      description: error.message || '删除过程中发生错误',
      color: 'error',
    })
    console.error('批量删除错误:', error)
  }
}

// 批量检测 LivePhoto 功能
const handleBatchDetectLivePhoto = async () => {
  try {
    const detectToast = toast.add({
      title: '正在批量检测 LivePhoto',
      description: '正在检查所有照片的 LivePhoto 状态...',
      color: 'info',
    })

    const result = await $fetch('/api/photos/livephoto-detect', {
      method: 'POST',
      body: {
        action: 'batch-detect',
      },
    }) as any

    const foundCount = result.results?.found || 0
    const totalCount = result.results?.total || 0

    toast.update(detectToast.id, {
      title: 'LivePhoto 检测完成',
      description: `检测了 ${totalCount} 张照片，发现 ${foundCount} 个潜在的 LivePhoto`,
      color: foundCount > 0 ? 'success' : 'info',
    })

    if (foundCount > 0) {
      await refresh()
    }
  } catch (error: any) {
    console.error('批量检测 LivePhoto 失败:', error)
    toast.add({
      title: '批量检测失败',
      description: error.message || '检测过程中发生错误',
      color: 'error',
    })
  }
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
        description="支持 JPEG、PNG、HEIC 格式照片，以及 MOV 格式 LivePhoto 视频，最大 256MB"
        layout="list"
        size="xl"
        accept="image/jpeg,image/png,image/heic,image/heif,video/quicktime,.mov"
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

    <!-- 工具栏 -->
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div class="flex items-center gap-2">
        <UIcon
          name="tabler:photo"
          class="text-gray-500"
        />
        <span class="font-medium text-gray-700 dark:text-gray-300">
          照片管理
        </span>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="livePhotoStats.total > 0"
            variant="soft"
            color="info"
          >
            {{ livePhotoStats.total }} 张照片
          </UBadge>
          <UBadge
            v-if="livePhotoStats.livePhotos > 0"
            variant="soft"
            color="success"
          >
            {{ livePhotoStats.livePhotos }} Live Photo
          </UBadge>
          <UBadge
            v-if="livePhotoStats.staticPhotos > 0"
            variant="soft"
            color="neutral"
          >
            {{ livePhotoStats.staticPhotos }} 静态照片
          </UBadge>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- 过滤器 -->
        <USelectMenu
          v-model="photoFilter"
          class="w-48"
          :items="[
            { label: '全部照片', value: 'all', icon: 'tabler:photo-scan' },
            { label: 'Live Photo', value: 'livephoto', icon: 'tabler:live-photo' },
            { label: '静态照片', value: 'static', icon: 'tabler:photo' }
          ]"
          value-key="value"
          label-key="label"
          size="sm"
        >
        </USelectMenu>

        <!-- LivePhoto 批量检测按钮 -->
        <UButton
          variant="soft"
          color="info"
          size="sm"
          icon="tabler:scan"
          @click="handleBatchDetectLivePhoto"
        >
          批量检测 LivePhoto
        </UButton>
        
        <!-- 刷新按钮 -->
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="tabler:refresh"
          @click="() => refresh()"
        >
          刷新
        </UButton>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div
      v-if="selectedRowsCount > 0"
      class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="tabler:check-circle"
          class="text-blue-500"
        />
        <span class="font-medium text-blue-700 dark:text-blue-300">
          已选择 {{ selectedRowsCount }} 张照片
        </span>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          size="sm"
          @click="rowSelection = {}"
        >
          取消选择
        </UButton>
        <UButton
          color="error"
          variant="soft"
          size="sm"
          icon="tabler:trash"
          @click="handleBatchDelete"
        >
          批量删除
        </UButton>
      </div>
    </div>

    <!-- 照片列表 -->
    <div
      class="border border-neutral-300 dark:border-neutral-800 rounded overflow-hidden"
    >
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="filteredData as Photo[]"
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
          <div class="flex items-center gap-2">
            <!-- LivePhoto 相关操作 -->
            <template v-if="row.original.isLivePhoto">
              <UButton
                size="sm"
                variant="soft"
                color="info"
                icon="tabler:live-photo"
                @click="handleViewLivePhoto(row.original.id)"
              >
                Live Photo 预览
              </UButton>
            </template>
            <template v-else>
              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                icon="tabler:refresh"
                @click="handleUpdateLivePhoto(row.original.id)"
              >
                检测 LivePhoto
              </UButton>
            </template>

            <!-- 删除按钮 -->
            <UButton
              size="sm"
              variant="soft"
              color="error"
              icon="tabler:trash"
              @click="handleDelete(row.original.id)"
            >
              删除
            </UButton>
          </div>
        </template>
      </UTable>

      <!-- 选择状态信息 -->
      <div
        class="px-4 py-3.5 border-t border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400"
      >
        {{ selectedRowsCount }} / {{ totalRowsCount }} 行已选择
      </div>
    </div>

    <!-- LivePhoto 预览模态框 -->
    <UModal v-model:open="isLivePhotoModalOpen">
      <template #content>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              Live Photo: {{ selectedLivePhoto?.title || 'Untitled' }}
            </h3>
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="tabler:x"
              @click="isLivePhotoModalOpen = false"
            />
          </div>

          <div v-if="selectedLivePhoto" class="space-y-4">
            <!-- 静态图片预览 -->
            <div class="space-y-2">
              <h4 class="font-medium text-sm text-gray-600 dark:text-gray-400">
                静态图片
              </h4>
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex justify-center">
                <img
                  :src="selectedLivePhoto.originalUrl"
                  :alt="selectedLivePhoto.title || 'Live Photo'"
                  class="max-h-64 object-contain rounded"
                />
              </div>
            </div>

            <!-- 视频预览 -->
            <div class="space-y-2">
              <h4 class="font-medium text-sm text-gray-600 dark:text-gray-400">
                Live Photo 视频
              </h4>
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex justify-center">
                <video
                  :src="selectedLivePhoto.videoUrl"
                  controls
                  autoplay
                  loop
                  muted
                  class="max-h-64 object-contain rounded"
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-2 pt-4 border-t">
              <UButton
                variant="ghost"
                color="neutral"
                icon="tabler:external-link"
                @click="() => { if (selectedLivePhoto) openInNewTab(selectedLivePhoto.videoUrl) }"
              >
                在新窗口打开视频
              </UButton>
              <UButton
                variant="soft"
                color="info"
                icon="tabler:download"
                @click="() => { if (selectedLivePhoto) openInNewTab(selectedLivePhoto.videoUrl) }"
              >
                下载视频
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped></style>
