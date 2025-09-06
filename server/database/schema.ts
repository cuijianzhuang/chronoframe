import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import type { NeededExif } from '~~/shared/types/photo'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('name').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password'),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isAdmin: integer('is_admin').default(0).notNull(),
})

export const photos = sqliteTable('photos', {
  id: text('id').primaryKey().unique(),
  title: text('title'),
  description: text('description'),
  width: integer('width'),
  height: integer('height'),
  aspectRatio: real('aspect_ratio'),
  dateTaken: text('date_taken'),
  storageKey: text('storage_key'),
  fileSize: integer('file_size'),
  lastModified: text('last_modified'),
  originalUrl: text('original_url'),
  thumbnailUrl: text('thumbnail_url'),
  thumbnailHash: text('thumbnail_hash'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  exif: text('exif', {mode: 'json'}).$type<NeededExif>(),
  // 地理位置信息
  latitude: real('latitude'),
  longitude: real('longitude'),
  country: text('country'),
  city: text('city'),
  locationName: text('location_name'),
  // LivePhoto 相关字段
  isLivePhoto: integer('is_live_photo').default(0).notNull(),
  livePhotoVideoUrl: text('live_photo_video_url'),
  livePhotoVideoKey: text('live_photo_video_key'),
})
