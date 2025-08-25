import sharp from "sharp"
import { generateBlurHash } from "./blurhash"

export const generateThumbnailAndHash = async (buffer: Buffer) => {
    const sharpInst = sharp(buffer).rotate()
    const thumbnailBuffer = await sharpInst
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 100 })
      .toBuffer()
    const thumbnailHash = await generateBlurHash(thumbnailBuffer)
    return { thumbnailBuffer, thumbnailHash }
}