import path from 'path'
import bmp from '@vingle/bmp-js'
import heicConvert from 'heic-convert'
import { getStorageManager } from '~~/server/plugins/storage'
import sharp from 'sharp'

export interface ProcessedImageData {
  sharpInst: sharp.Sharp
  imageBuffer: Buffer
  metadata: ImageMeta
}

export interface ImageMeta {
  width: number
  height: number
  format: string
}

const isBitmap = (buffer: Buffer) => {
  if (buffer.length < 2) return false
  const header = buffer.toString('hex', 0, 2)
  return header === '424d'
}

const getMetadataWithSharp = async (
  sharpInst: sharp.Sharp,
): Promise<ImageMeta | null> => {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.image.info(`Extracting metadata (attempt ${attempt}/${maxRetries})...`)
      
      const metadata = await Promise.race([
        sharpInst.metadata(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Metadata extraction timeout')), 10000)
        )
      ])

      if (!metadata.height || !metadata.width || !metadata.format) {
        logger.image.warn('Incomplete metadata received:', { 
          hasHeight: !!metadata.height, 
          hasWidth: !!metadata.width, 
          hasFormat: !!metadata.format 
        })
        return null
      }

      const { orientation } = metadata
      let { width, height } = metadata

      if (orientation && [5, 6, 7, 8].includes(orientation)) {
        ;[width, height] = [height, width]
      }

      logger.image.info(`Successfully extracted metadata: ${width}x${height} ${metadata.format}`)
      return {
        width: width,
        height: height,
        format: metadata.format,
      }
    } catch (err) {
      lastError = err as Error
      logger.image.warn(`Metadata extraction attempt ${attempt} failed:`, err)
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt))
      }
    }
  }

  logger.image.error('All metadata extraction attempts failed')
  return null
}

export const convertHeicToJpeg = async (heicBuffer: Buffer) => {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.image.info(`Converting HEIC to JPEG (attempt ${attempt}/${maxRetries})...`)

      // 检查文件大小，如果太大则降低质量
      const fileSizeMB = heicBuffer.length / (1024 * 1024)
      const quality = fileSizeMB > 10 ? 0.8 : 0.95

      const jpegBuffer = await Promise.race([
        heicConvert({
          // @ts-expect-error idk why there is a type error here
          buffer: heicBuffer,
          format: 'JPEG',
          quality,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('HEIC conversion timeout')), 30000)
        )
      ])

      logger.image.info(`Successfully converted HEIC to JPEG (quality: ${quality})`)
      return Buffer.from(jpegBuffer as ArrayBuffer)
    } catch (err) {
      lastError = err as Error
      logger.image.warn(`HEIC conversion attempt ${attempt} failed:`, err)
      
      if (attempt < maxRetries) {
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  logger.image.error('All HEIC conversion attempts failed')
  throw lastError || new Error('HEIC conversion failed after all retries')
}

export const convertBitmapToSharpInst = async (bitmapBuffer: Buffer) => {
  logger.image.info('Converting Bitmap to JPEG...')
  const bmpImage = bmp.decode(bitmapBuffer, true)
  if (!bmpImage) {
    throw new Error('Failed to decode BMP image')
  }

  const channels = bmpImage.data.length / (bmpImage.width * bmpImage.height)
  if (channels !== 3 && channels !== 4) {
    throw new Error(`Unsupported BMP channel count: ${channels}`)
  }

  return sharp(bmpImage.data, {
    raw: { width: bmpImage.width, height: bmpImage.height, channels },
  }).jpeg()
}

export const preprocessImageBuffer = async (
  buffer: Buffer,
  key: string,
): Promise<Buffer> => {
  const extName = path.extname(key).toLowerCase()

  if (['.heic', '.heif', '.hif'].includes(extName)) {
    logger.image.info('HEIC image detected', key)
    return await convertHeicToJpeg(buffer)
  }

  return buffer
}

export const preprocessImageWithJpegUpload = async (
  s3key: string,
): Promise<{
  raw: Buffer
  processed: Buffer
  jpegKey?: string // HEIC 转换后上传的 JPEG 文件的 key
} | null> => {
  const storageProvider = getStorageManager().getProvider()
  if (!storageProvider) return null

  try {
    const rawImageBuffer = await storageProvider.get(s3key)
    if (!rawImageBuffer) {
      logger.image.error(`Image not found in storage: ${s3key}`)
      return null
    }

    const extName = path.extname(s3key).toLowerCase()
    let processedBuffer: Buffer
    let jpegKey: string | undefined
    let jpegStorageKey: string | undefined

    if (['.heic', '.heif', '.hif'].includes(extName)) {
      logger.image.info(
        'HEIC image detected, converting and uploading JPEG version',
        s3key,
      )

      try {
        processedBuffer = await convertHeicToJpeg(rawImageBuffer)

        // 生成 JPEG 版本的 key（替换扩展名为 .jpg）
        const baseName = path.basename(s3key, path.extname(s3key))
        jpegKey = `${baseName}.jpeg`

        // 上传 JPEG 版本到存储
        jpegStorageKey = (
          await storageProvider.create(jpegKey, processedBuffer, 'image/jpeg')
        ).key
        logger.image.info(`Uploaded JPEG version to: ${jpegKey}`)
      } catch (err) {
        logger.image.error(`HEIC conversion failed: ${s3key}`, err)
        return null
      }
    } else {
      processedBuffer = rawImageBuffer
    }

    return {
      raw: rawImageBuffer,
      processed: processedBuffer,
      jpegKey: jpegStorageKey,
    }
  } catch (err) {
    logger.image.error(`Image preprocessing failed: ${s3key}`, err)
    return null
  }
}

export const preprocessImage = async (
  s3key: string,
): Promise<{
  raw: Buffer
  processed: Buffer
} | null> => {
  const storageProvider = getStorageManager().getProvider()
  if (!storageProvider) return null

  try {
    const rawImageBuffer = await storageProvider.get(s3key)
    if (!rawImageBuffer) {
      logger.image.error(`Image not found in storage: ${s3key}`)
      return null
    }

    let imageOrHeicBuffer: Buffer
    try {
      imageOrHeicBuffer = await preprocessImageBuffer(rawImageBuffer, s3key)
    } catch (err) {
      logger.image.error(`Image preprocessing failed: ${s3key}`, err)
      return null
    }

    return {
      raw: rawImageBuffer,
      processed: imageOrHeicBuffer,
    }
  } catch (err) {
    logger.image.error(`Image preprocessing failed: ${s3key}`, err)
    return null
  }
}

export const processImageMetadataAndSharp = async (
  buffer: Buffer,
  s3key: string,
): Promise<ProcessedImageData | null> => {
  try {
    let sharpInst = sharp(buffer)
    let convertedBuffer = buffer

    if (isBitmap(buffer)) {
      logger.image.info('Bitmap image detected, converting to JPEG...', s3key)
      try {
        sharpInst = await convertBitmapToSharpInst(buffer)
        convertedBuffer = await sharpInst.toBuffer()
      } catch (err) {
        logger.image.error(`Bitmap conversion failed: ${s3key}`, err)
        return null
      }
    }

    const metadata = await getMetadataWithSharp(sharpInst)
    if (!metadata) {
      return null
    }

    return {
      sharpInst,
      imageBuffer: convertedBuffer,
      metadata,
    }
  } catch (err) {
    logger.image.error(`Image processing with Sharp failed: ${s3key}`, err)
    return null
  }
}
