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
import {
  extractLocationFromGPS,
  parseGPSCoordinates,
} from '../location/geocoding'
import { findLivePhotoVideoForImage } from '../video/livephoto'
import { generateSafePhotoId } from '~~/server/utils/file-utils'

/**
 * 异步执行照片处理管道 - 不阻塞主线程
 */
export const execPhotoPipelineAsync = async (
  s3key: string,
  storageObject: StorageObject,
): Promise<Photo | null> => {
  return new Promise((resolve, reject) => {
    // 使用 setImmediate 确保处理在下一个事件循环中执行
    setImmediate(async () => {
      try {
        const result = await processPhotoInternal(s3key, storageObject)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  })
}

/**
 * 内部照片处理函数
 */
async function processPhotoInternal(
  s3key: string,
  storageObject: StorageObject,
): Promise<Photo | null> {
  const log = logger.image
  const storageProvider = getStorageManager().getProvider()
  const photoId = generateSafePhotoId(s3key)

  try {
    log.info(`Starting async processing for ${s3key}`)

    // 步骤1: 预处理图片并上传JPEG版本
    const imageBuffers = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await preprocessImageWithJpegUpload(s3key)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    if (!imageBuffers) {
      log.error(`Image preprocessing failed for ${s3key}`)
      return null
    }

    // 步骤2: 处理图片元数据和Sharp处理
    const processedData = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await processImageMetadataAndSharp(
            imageBuffers.processed,
            s3key,
          )
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    if (!processedData) {
      log.error(`Image processing failed for ${s3key}`)
      return null
    }

    const { imageBuffer, metadata } = processedData

    // 步骤3: 生成缩略图和哈希值
    const { thumbnailBuffer, thumbnailHash } = await new Promise<any>(
      (resolve, reject) => {
        setImmediate(async () => {
          try {
            const result = await generateThumbnailAndHash(imageBuffer, logger.image)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
      },
    )

    // TODO 步骤4: 直方图和影调分析
    // const histogramData = await new Promise<any>((resolve, reject) => {
    //   setImmediate(async () => {
    //     try {
    //       const result = await calculateHistogram(processedData.sharpInst)
    //       resolve(result)
    //     } catch (error) {
    //       reject(error)
    //     }
    //   })
    // })

    // 步骤5: 提取EXIF数据
    const exifData = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await extractExifData(
            imageBuffer,
            imageBuffers.raw,
            logger.image,
          )
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    // 步骤6: 提取照片基本信息
    const photoInfo = extractPhotoInfo(s3key, exifData)

    // 步骤7: 处理地理位置信息
    let locationInfo = null
    if (exifData) {
      const { latitude, longitude } = parseGPSCoordinates(exifData)
      if (latitude && longitude) {
        locationInfo = await new Promise<any>((resolve, reject) => {
          setImmediate(async () => {
            try {
              const result = await extractLocationFromGPS(latitude, longitude)
              resolve(result)
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    }

    // 步骤8: 配对 LivePhoto 视频文件
    let livePhotoInfo = null
    const livePhotoVideo = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await findLivePhotoVideoForImage(s3key)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

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

    // 步骤9: 上传缩略图到存储服务
    const thumbnailObject = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await storageProvider.create(
            `thumbnails/${photoId}.webp`,
            thumbnailBuffer,
            'image/webp',
          )
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    // 步骤10: 构建最终的Photo对象
    const result: Photo = {
      id: photoId,
      title: photoInfo.title,
      description: photoInfo.description,
      dateTaken: photoInfo.dateTaken,
      tags: photoInfo.tags,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width / metadata.height,
      storageKey: s3key,
      thumbnailKey: thumbnailObject.key,
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
      latitude: locationInfo?.latitude || null,
      longitude: locationInfo?.longitude || null,
      country: locationInfo?.country || null,
      city: locationInfo?.city || null,
      locationName: locationInfo?.locationName || null,
      // LivePhoto 相关字段
      isLivePhoto: livePhotoInfo?.isLivePhoto || 0,
      livePhotoVideoUrl: livePhotoInfo?.livePhotoVideoUrl || null,
      livePhotoVideoKey: livePhotoInfo?.livePhotoVideoKey || null,
    }

    log.info(`Async processing completed for ${s3key}`)
    return result
  } catch (err) {
    log.error(`Photo pipeline failed for ${s3key}`, err)
    return null
  }
}

/**
 * 批量异步处理照片
 */
export const execBatchPhotoPipelineAsync = async (
  photos: Array<{ s3key: string; storageObject: StorageObject }>,
  maxConcurrent = 3,
): Promise<Array<{ s3key: string; photo: Photo | null; error?: string }>> => {
  const results: Array<{ s3key: string; photo: Photo | null; error?: string }> =
    []

  // 分批处理以限制并发数
  for (let i = 0; i < photos.length; i += maxConcurrent) {
    const batch = photos.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(async ({ s3key, storageObject }) => {
      try {
        const photo = await execPhotoPipelineAsync(s3key, storageObject)
        return {
          s3key,
          photo,
          error: photo ? undefined : 'Processing failed',
        }
      } catch (error) {
        return {
          s3key,
          photo: null,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)

    logger.image.info(
      `Processed async batch ${Math.floor(i / maxConcurrent) + 1} of ${Math.ceil(photos.length / maxConcurrent)}`,
    )
  }

  return results
}
