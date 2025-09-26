import sharp from 'sharp'
import { generateBlurHash } from './blurhash'

export const generateThumbnailAndHash = async (
  buffer: Buffer,
  logger?: Logger[keyof Logger],
) => {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger?.info(`Generating thumbnail (attempt ${attempt}/${maxRetries})...`)
      
      const sharpInst = sharp(buffer).rotate()
      
      // 根据文件大小调整缩略图质量
      const fileSizeMB = buffer.length / (1024 * 1024)
      const quality = fileSizeMB > 5 ? 85 : 100
      
      const thumbnailBuffer = await Promise.race([
        sharpInst
          .resize(600, null, { 
            withoutEnlargement: true,
            fastShrinkOnLoad: false // 提高质量
          })
          .webp({ quality })
          .toBuffer(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Thumbnail generation timeout')), 15000)
        )
      ])
      
      logger?.info(`Successfully generated thumbnail (quality: ${quality})`)
      
      // 生成BlurHash
      const thumbnailHash = await generateBlurHash(thumbnailBuffer, logger)
      
      return { thumbnailBuffer, thumbnailHash }
    } catch (err) {
      lastError = err as Error
      logger?.warn(`Thumbnail generation attempt ${attempt} failed:`, err)
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt))
      }
    }
  }

  logger?.error('All thumbnail generation attempts failed')
  throw lastError || new Error('Thumbnail generation failed after all retries')
}
