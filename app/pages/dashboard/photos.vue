<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { StorageObject } from '~~/server/services/storage'
import type { Photo } from '~~/server/utils/db'

definePageMeta({
  layout: 'dashboard',
})

const { data, status, refresh } = useFetch('/api/photos')

// 原生文件上传函数
const uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await $fetch('/api/photos', {
      method: 'PUT',
      body: formData
    })
    
    return response
  } catch (error: any) {
    console.error('上传请求失败:', error)
    
    // 提供更详细的错误信息
    if (error.response?.status === 401) {
      throw new Error('未授权，请重新登录')
    } else if (error.response?.status === 413) {
      throw new Error('文件太大，请选择更小的文件')
    } else if (error.response?.status === 415) {
      throw new Error('不支持的文件格式')
    } else {
      throw new Error(error.message || '上传失败，请重试')
    }
  }
}

// 处理状态
const processingFiles = ref<Set<string>>(new Set())
const toast = useToast()

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
        color: 'success'
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
      error: `文件太大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持 128MB。`
    }
  }
  
  return { valid: true }
}

const handleFileUpload = async (files: unknown) => {
  // 处理 UFileUpload 的输出格式
  let fileList: File[] = []
  
  if (files && Array.isArray(files)) {
    fileList = files.filter((f): f is File => f instanceof File)
  } else if (files instanceof File) {
    fileList = [files]
  } else {
    console.warn('无效的文件类型:', files)
    return
  }
  
  for (const file of fileList) {
    // 验证文件
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.add({
        title: '文件验证失败',
        description: validation.error,
        color: 'error'
      })
      continue
    }
    
    const fileName = file.name
    processingFiles.value.add(fileName)
    
    toast.add({
      title: '开始处理照片',
      description: `正在后台处理 ${fileName}，请稍候...`,
      color: 'info'
    })
    
    try {
      await uploadImage(file)
      
      // 开始状态检查
      if (!statusInterval) {
        statusInterval = setInterval(checkProcessingStatus, 2000)
      }
    } catch (error: any) {
      processingFiles.value.delete(fileName)
      toast.add({
        title: '上传失败',
        description: `${fileName}: ${error.message}`,
        color: 'error'
      })
      console.error('上传错误:', error)
    }
  }
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
    <!-- 处理状态指示器 -->
    <div v-if="processingFiles.size > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-blue-500" />
        <span class="text-blue-700 font-medium">
          正在后台处理 {{ processingFiles.size }} 个文件...
        </span>
      </div>
      <p class="text-sm text-blue-600 mt-1">
        处理完成后会自动刷新列表，您可以继续浏览其他页面
      </p>
    </div>

    <UFileUpload
      label="上传照片"
      description="支持 JPEG、PNG、HEIC 格式，最大 128MB"
      layout="list"
      size="xl"
      accept="image/jpeg,image/png,image/heic,image/heif"
      multiple
      @update:model-value="handleFileUpload"
    />
    <div class="border border-neutral-300 rounded overflow-hidden">
      <UTable
        :data="data as Photo[]"
        :columns="columns"
        :loading="status === 'pending'"
        sticky
        class="h-[600px]"
        :ui="{
          separator: 'bg-(--ui-color-neutral-200)',
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
