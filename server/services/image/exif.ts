import path from 'node:path'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import sharp, { Metadata } from 'sharp'
import type { NeededExif, PhotoInfo } from '../../../shared/types/photo'
import exifr from 'exifr'
import { exiftool, ExifDateTime, Tags } from 'exiftool-vendored'
import { noop } from 'es-toolkit'
import { Logger } from '~~/server/utils/logger'

const neededKeys: Array<keyof Tags | (string & {})> = [
  'Title',
  'Subject',
  'Keywords',

  'tz',
  'tzSource',
  'Orientation',
  'Make',
  'Model',
  'Software',
  'Artist',
  'Copyright',
  'ExposureTime',

  'FNumber',
  'ExposureProgram',
  'ISO',
  'OffsetTime',
  'OffsetTimeOriginal',
  'OffsetTimeDigitized',
  'ShutterSpeedValue',
  'ApertureValue',
  'BrightnessValue',
  'ExposureCompensationSet',
  'ExposureCompensationMode',
  'ExposureCompensationSetting',

  'ExposureCompensation',
  'MaxApertureValue',
  'LightSource',
  'Flash',
  'FocalLength',

  'ColorSpace',
  'ExposureMode',
  'FocalLengthIn35mmFormat',
  'SceneCaptureType',
  'LensMake',
  'LensModel',
  'MeteringMode',
  'WhiteBalance',
  'WBShiftAB',
  'WBShiftGM',
  'WhiteBalanceBias',
  'WhiteBalanceFineTune',
  'FlashMeteringMode',
  'SensingMethod',
  'FocalPlaneXResolution',
  'FocalPlaneYResolution',

  'Aperture',
  'ScaleFactor35efl',
  'ShutterSpeed',
  'LightValue',
  'Rating',

  'GPSAltitude',
  'GPSCoordinates',
  'GPSAltitudeRef',
  'GPSLatitude',
  'GPSLatitudeRef',
  'GPSLongitude',
  'GPSLongitudeRef',

  'MPImageType',
]

const formatExifDate = (date: string | ExifDateTime | undefined) => {
  if (!date) {
    return
  }

  if (typeof date === 'string') {
    return new Date(date).toISOString()
  }

  return date.toISOString()
}

const processExifData = (exifData: Tags, metadata: Metadata): NeededExif => {
  const date = {
    DateTimeOriginal: formatExifDate(exifData.DateTimeOriginal),
    DateTimeDigitized: formatExifDate(exifData.DateTimeDigitized),
    OffsetTime: exifData.OffsetTime,
    OffsetTimeOriginal: exifData.OffsetTimeOriginal,
    OffsetTimeDigitized: exifData.OffsetTimeDigitized,
  }

  const size = {
    ImageWidth: exifData.ExifImageWidth || metadata.width,
    ImageHeight: exifData.ExifImageHeight || metadata.height,
  }
  const result: any = structuredClone(exifData)
  for (const key in result) {
    Reflect.deleteProperty(result, key)
  }
  for (const key of neededKeys) {
    result[key] = (exifData as any)[key]
  }

  return {
    ...date,
    ...size,
    ...result,
  }
}

export const extractExifData = async (
  imageBuffer: Buffer,
  rawImageBuffer?: Buffer,
  logger?: Logger['image'],
): Promise<NeededExif | null> => {
  try {
    let metadata = await sharp(imageBuffer).metadata()

    if (!metadata.exif && rawImageBuffer) {
      try {
        metadata = await sharp(rawImageBuffer).metadata()
      } catch (err) {
        logger?.warn('Error extracting EXIF data from raw image buffer:', err)
      }
    }

    if (!metadata.exif) {
      logger?.warn('No EXIF data found in image metadata')
      return null
    }

    // const exifData = await exifr.parse(rawImageBuffer || imageBuffer, true)
    // return processExifData(exifData, metadata)

    logger?.info('Extracting EXIF data using exiftool...')

    const tempDir = path.resolve(process.cwd(), 'exif_workdir')
    await mkdir(tempDir, { recursive: true })
    const tempImagePath = path.resolve(tempDir, `${crypto.randomUUID()}.jpg`)

    await writeFile(tempImagePath, rawImageBuffer || imageBuffer)
    const exifData = await exiftool.read(tempImagePath)
    const result = processExifData(exifData, metadata)

    await unlink(tempImagePath).catch(noop)
    return result
  } catch (err) {
    logger?.error('EXIF extraction failed:', err)
    return null
  }
}

export const extractPhotoInfo = (
  s3key: string,
  exifData?: NeededExif | null,
): PhotoInfo => {
  const fileName = path.basename(s3key, path.extname(s3key))

  let title = fileName
  let dateTaken = new Date().toISOString()
  let views = 0
  let tags: string[] = []

  const dirPath = path.dirname(s3key)
  if (exifData?.Subject || exifData?.Keywords) {
    tags = [...(exifData.Subject || []), ...(exifData.Keywords || [])]
  } else if (dirPath && dirPath !== '.' && dirPath !== '/') {
    let relativePath = dirPath
    relativePath = dirPath.slice('/photos'.length)

    relativePath = relativePath.replaceAll(/^\/+|\/+$/g, '')

    if (relativePath) {
      const pathParts = relativePath
        .split('/')
        .filter((part) => part.trim() !== '')
      tags = pathParts.map((part) => part.trim())
    }
  }

  if (exifData?.DateTimeOriginal) {
    try {
      const dateTimeOriginal = new Date(exifData.DateTimeOriginal)

      if (dateTimeOriginal instanceof Date) {
        dateTaken = dateTimeOriginal.toISOString()
      }
    } catch (error) {
      logger.image.warn(
        `Parse EXIF DateTimeOriginal failed: ${exifData.DateTimeOriginal}`,
        error,
      )
    }
  } else {
    const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      dateTaken = new Date(dateMatch[1]).toISOString()
    }
  }

  const viewsMatch = fileName.match(/(\d+)views?/i)
  if (viewsMatch) {
    views = Number.parseInt(viewsMatch[1])
  }

  title =
    exifData?.Title ||
    fileName
      .replaceAll(/\d{4}-\d{2}-\d{2}[_-]?/g, '')
      .replaceAll(/[_-]?\d+views?/gi, '')
      .replaceAll(/[_-]+/g, ' ')
      .trim()

  if (!title) {
    title = path.basename(s3key, path.extname(s3key))
  }

  return {
    title,
    dateTaken,
    tags,
    description: '',
  }
}
