import path from 'path'
import {
  preprocessImage,
  processImageMetadataAndSharp,
} from '../image/processor'
import { generateThumbnailAndHash } from '../image/thumbnail'
import { Photo } from '~~/server/utils/db'
import { getStorageManager } from '~~/server/plugins/storage'
import { compressUint8Array } from '~~/shared/utils/u8array'
import { StorageObject } from '../storage'
import { extractExifData, extractPhotoInfo } from '../image/exif'

const generatePhotoId = (s3key: string) => {
  return path.basename(s3key, path.extname(s3key)).replace(/ /g, '_')
}

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
  const photoId = generatePhotoId(s3key)

  try {
    log.info(`Starting async processing for ${s3key}`)

    // 使用 Promise 包装每个步骤，确保异步执行
    const imageBuffers = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await preprocessImage(s3key)
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

    const { sharpInst, imageBuffer, metadata } = processedData

    const { thumbnailBuffer, thumbnailHash } = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await generateThumbnailAndHash(imageBuffer)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    const exifData = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await extractExifData(imageBuffer, imageBuffers.raw, log)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    const photoInfo = extractPhotoInfo(s3key, exifData)

    const thumbnailObject = await new Promise<any>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const result = await storageProvider.create(
            `thumbnails/${photoId}.webp`,
            thumbnailBuffer,
            'image/webp'
          )
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

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
      fileSize: storageObject.size || null,
      lastModified:
        storageObject.lastModified?.toISOString() || new Date().toISOString(),
      originalUrl: storageProvider.getPublicUrl(s3key),
      thumbnailUrl: storageProvider.getPublicUrl(thumbnailObject.key),
      thumbnailHash: thumbnailHash ? compressUint8Array(thumbnailHash) : null,
      exif: exifData,
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
  maxConcurrent = 3
): Promise<Array<{ s3key: string; photo: Photo | null; error?: string }>> => {
  const results: Array<{ s3key: string; photo: Photo | null; error?: string }> = []
  
  // 分批处理以限制并发数
  for (let i = 0; i < photos.length; i += maxConcurrent) {
    const batch = photos.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(async ({ s3key, storageObject }) => {
      try {
        const photo = await execPhotoPipelineAsync(s3key, storageObject)
        return {
          s3key,
          photo,
          error: photo ? undefined : 'Processing failed'
        }
      } catch (error) {
        return {
          s3key,
          photo: null,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    logger.image.info(`Processed async batch ${Math.floor(i / maxConcurrent) + 1} of ${Math.ceil(photos.length / maxConcurrent)}`)
  }
  
  return results
}
