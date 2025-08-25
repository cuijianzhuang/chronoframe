<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { StorageObject } from '~~/server/services/storage'
import type { Photo } from '~~/server/utils/db'

definePageMeta({
  layout: 'dashboard',
})

const { data, status, refresh } = useFetch('/api/photos')
const uploadImage = useUpload('/api/photos', {
  method: 'PUT',
})

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
  }
]

const handleFileUpload = async (file: any) => {
  await uploadImage(file)
  refresh()
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full p-4">
    <UFileUpload
      label="上传照片"
      description="支持 JPEG, PNG, HEIC 格式"
      layout="list"
      size="xl"
      accept="image/jpeg,image/png,image/heic"
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
      />
    </div>
  </div>
</template>

<style scoped></style>
