import path from 'path'
import {
  preprocessImageWithJpegUpload,
  processImageMetadataAndSharp,
} from '../image/processor'
import { generateThumbnailAndHash } from '../image/thumbnail'
import type { Photo } from '~~/server/utils/db'
import { getStorageManager } from '~~/server/plugins/storage'
import { compressUint8Array } from '~~/shared/utils/u8array'
import type { StorageObject } from '../storage'
import { extractExifData, extractPhotoInfo } from '../image/exif'
import { findLivePhotoVideoForImage } from '../video/livephoto'

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
    const imageBuffers = await preprocessImageWithJpegUpload(s3key)
    if (!imageBuffers) return null

    // 2. 转换 BMP 格式，返回 Sharp 实例
    const processedData = await processImageMetadataAndSharp(
      imageBuffers.processed,
      s3key,
    )
    if (!processedData) return null
    const { imageBuffer, metadata } = processedData

    // 3. 生成缩略图和 BlurHash
    const { thumbnailBuffer, thumbnailHash } =
      await generateThumbnailAndHash(imageBuffer)

    // 4. EXIF
    const exifData = await extractExifData(imageBuffer, imageBuffers.raw, log)

    // 5. 提取照片信息
    const photoInfo = extractPhotoInfo(s3key, exifData)

    // 6. 检查是否有对应的 LivePhoto 视频文件
    const livePhotoVideo = await findLivePhotoVideoForImage(s3key)
    let livePhotoInfo = null

    if (livePhotoVideo) {
      livePhotoInfo = {
        isLivePhoto: 1,
        livePhotoVideoUrl: storageProvider.getPublicUrl(
          livePhotoVideo.videoKey,
        ),
        livePhotoVideoKey: livePhotoVideo.videoKey,
      }
      log.info(`LivePhoto video found for ${s3key}: ${livePhotoVideo.videoKey}`)
    }

    // 7. 上传缩略图
    const thumbnailObject = await storageProvider.create(
      `thumbnails/${photoId}.webp`,
      thumbnailBuffer,
      'image/webp',
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
      originalUrl: imageBuffers.jpegKey
        ? storageProvider.getPublicUrl(imageBuffers.jpegKey) // 使用 JPEG 版本作为 originalUrl
        : storageProvider.getPublicUrl(s3key),
      thumbnailUrl: storageProvider.getPublicUrl(thumbnailObject.key),
      thumbnailHash: thumbnailHash ? compressUint8Array(thumbnailHash) : null,
      exif: exifData,
      // 地理位置信息
      latitude: null,
      longitude: null,
      country: null,
      city: null,
      locationName: null,
      // LivePhoto 相关字段
      isLivePhoto: livePhotoInfo?.isLivePhoto || 0,
      livePhotoVideoUrl: livePhotoInfo?.livePhotoVideoUrl || null,
      livePhotoVideoKey: livePhotoInfo?.livePhotoVideoKey || null,
    }
  } catch (err) {
    log.error(`Photo pipeline failed for ${s3key}`, err)
    return null
  }
}
