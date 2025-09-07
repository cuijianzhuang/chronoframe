export interface PhotoMarker {
  id: string
  latitude: number
  longitude: number
  title?: string
  thumbnailUrl?: string
  thumbnailHash?: string
  dateTaken?: string
  city?: string
  exif?: any
}

export interface ClusterPoint {
  type: 'Feature'
  properties: {
    marker?: PhotoMarker
    cluster?: boolean
    point_count?: number
    point_count_abbreviated?: string
    clusteredPhotos?: PhotoMarker[]
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}
