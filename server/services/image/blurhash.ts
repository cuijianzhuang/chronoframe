import sharp from 'sharp'
import { rgbaToThumbHash } from 'thumbhash'

export const generateBlurHash = async (buffer: Buffer) => {
  try {
    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .ensureAlpha()
      .toBuffer({
        resolveWithObject: true,
      })

    const thumbHash = rgbaToThumbHash(info.width, info.height, data)
    return thumbHash
  } catch (error) {
    logger.image.error('Generate thumbhash failed', error)
    return null
  }
}
