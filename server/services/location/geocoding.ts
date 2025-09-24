export interface LocationInfo {
  latitude: number
  longitude: number
  country?: string
  city?: string
  locationName?: string
}

export interface GeocodingProvider {
  reverseGeocode(lat: number, lon: number): Promise<LocationInfo | null>
}

/**
 * OpenStreetMap Nominatim API 地理编码提供者
 * 免费的地理编码服务，适合开发和小规模使用
 * TODO: 实现 MapBox 逆编码提供者
 */
class NominatimGeocodingProvider implements GeocodingProvider {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org'
  private readonly userAgent = 'chronoframe/1.0'
  private lastRequestTime = 0
  private readonly rateLimitMs = 1000 // Nominatim 要求至少1秒间隔

  async reverseGeocode(lat: number, lon: number): Promise<LocationInfo | null> {
    try {
      // 应用速率限制
      await this.applyRateLimit()

      const url = new URL('/reverse', this.baseUrl)
      url.searchParams.set('lat', lat.toString())
      url.searchParams.set('lon', lon.toString())
      url.searchParams.set('format', 'json')
      url.searchParams.set('addressdetails', '1')
      url.searchParams.set('accept-language', 'zh-CN,zh,en')

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        logger.location.warn(
          `Nominatim API responded with status ${response.status}`,
        )
        return null
      }

      const data = await response.json()

      if (!data || data.error) {
        logger.location.warn('Nominatim API returned error:', data?.error)
        return null
      }

      const address = data.address || {}

      // 提取国家信息
      const country = address.country || address.country_code?.toUpperCase()

      // 提取城市信息（优先级：district > city > town > county > state > village > hamlet）
      // 适配中国行政区划
      const city =
        address.district ||
        address.city ||
        address.town ||
        address.county ||
        address.state ||
        address.village ||
        address.hamlet

      // 构建位置名称
      const locationName = data.display_name

      return {
        latitude: lat,
        longitude: lon,
        country,
        city,
        locationName,
      }
    } catch (error) {
      logger.location.error('Reverse geocoding failed:', error)
      return null
    }
  }

  private async applyRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.rateLimitMs) {
      const delay = this.rateLimitMs - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    this.lastRequestTime = Date.now()
  }
}

/**
 * 从GPS坐标中提取地理位置信息
 */
export async function extractLocationFromGPS(
  gpsLatitude?: number,
  gpsLongitude?: number,
  provider: GeocodingProvider = new NominatimGeocodingProvider(),
): Promise<LocationInfo | null> {
  if (!gpsLatitude || !gpsLongitude) {
    return null
  }

  // 验证坐标范围
  if (Math.abs(gpsLatitude) > 90 || Math.abs(gpsLongitude) > 180) {
    logger.location.warn(
      `Invalid GPS coordinates: ${gpsLatitude}, ${gpsLongitude}`,
    )
    return null
  }

  logger.location.info(
    `Reverse geocoding coordinates: ${gpsLatitude}, ${gpsLongitude}`,
  )

  try {
    const locationInfo = await provider.reverseGeocode(
      gpsLatitude,
      gpsLongitude,
    )

    if (locationInfo) {
      logger.location.success(
        `Location found: ${locationInfo.city}, ${locationInfo.country}`,
      )
    } else {
      logger.location.warn('No location found for coordinates')
    }

    return locationInfo
  } catch (error) {
    logger.location.error('Location extraction failed:', error)
    return null
  }
}

/**
 * 解析EXIF GPS数据为十进制度数
 */
export function parseGPSCoordinates(exifData: any): {
  latitude?: number
  longitude?: number
} {
  try {
    let latitude: number | undefined
    let longitude: number | undefined

    // 尝试从GPSLatitude和GPSLongitude获取
    if (exifData.GPSLatitude && exifData.GPSLongitude) {
      latitude = parseFloat(exifData.GPSLatitude.toString())
      longitude = parseFloat(exifData.GPSLongitude.toString())
    }

    // 如果上面的方法失败，尝试从GPSCoordinates获取
    if ((!latitude || !longitude) && exifData.GPSCoordinates) {
      const coords = exifData.GPSCoordinates.toString()
      const match = coords.match(/([-+]?\d+\.?\d*)[°,\s]+([-+]?\d+\.?\d*)/)
      if (match) {
        latitude = parseFloat(match[1])
        longitude = parseFloat(match[2])
      }
    }

    // 应用GPS参考（南纬为负，西经为负）
    if (latitude && exifData.GPSLatitudeRef === 'S') {
      latitude = -Math.abs(latitude)
    }
    if (longitude && exifData.GPSLongitudeRef === 'W') {
      longitude = -Math.abs(longitude)
    }

    return { latitude, longitude }
  } catch (error) {
    logger.location.error('Failed to parse GPS coordinates:', error)
    return {}
  }
}
