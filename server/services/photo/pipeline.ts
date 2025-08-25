import path from 'path'
import {
  preprocessImage,
  processImageMetadataAndSharp,
} from '../image/processor'
import { generateThumbnailAndHash } from '../image/thumbnail'
import { Photo } from '~~/server/utils/db'
import { getStorageManager } from '~~/server/plugins/storage'
import { compressUint8Array } from '~~/server/utils/u8array'
import { StorageObject } from '../storage'
import { extractExifData, extractPhotoInfo } from '../image/exif'

const generatePhotoId = (s3key: string) => {
  return path.basename(s3key, path.extname(s3key))
}

export const execPhotoPipeline = async (
  s3key: string,
  storageObject: StorageObject,
): Promise<Photo | null> => {
  const log = logger.image
  const storageProvider = getStorageManager().getProvider()
  const photoId = generatePhotoId(s3key)

  try {
    // 1. 预处理图片，分离原始 Buffer 和 HEIC 转换
    const imageBuffers = await preprocessImage(s3key)
    if (!imageBuffers) return null

    // 2. 转换 BMP 格式，返回 Sharp 实例
    const processedData = await processImageMetadataAndSharp(
      imageBuffers.processed,
      s3key,
    )
    if (!processedData) return null
    const { sharpInst, imageBuffer, metadata } = processedData

    // 3. 生成缩略图和 BlurHash
    const { thumbnailBuffer, thumbnailHash } =
      await generateThumbnailAndHash(imageBuffer)

    // 4. EXIF
    const exifData = await extractExifData(imageBuffer, imageBuffers.raw)

    // 5. 提取照片信息
    const photoInfo = extractPhotoInfo(s3key, exifData)

    // 6. 上传缩略图
    const thumbnailObject = await storageProvider.create(
      `thumbnails/${photoId}`,
      thumbnailBuffer,
    )

    return {
      id: photoId,
      title: photoInfo.title,
      description: photoInfo.description,
      dateTaken: photoInfo.dateTaken,
      tags: photoInfo.tags,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width / metadata.height,
      storageKey: s3key,
      fileSize: storageObject.size || null,
      lastModified:
        storageObject.lastModified?.toISOString() || new Date().toISOString(),
      originalUrl: storageProvider.getPublicUrl(s3key),
      thumbnailUrl: storageProvider.getPublicUrl(thumbnailObject.key),
      thumbnailHash: thumbnailHash ? compressUint8Array(thumbnailHash) : null,
      exif: exifData,
    }
  } catch (err) {
    log.error(`Photo pipeline failed for ${s3key}`, err)
    return null
  }
}
