import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { NeededExif } from '~~/shared/types/photo'

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
  description: text(),
  width: integer('width'),
  height: integer('height'),
  aspectRatio: integer('aspect_ratio'),
  dateTaken: text('date_taken'),
  storageKey: text('storage_key'),
  fileSize: integer('file_size'),
  lastModified: text('last_modified'),
  originalUrl: text('original_url'),
  thumbnailUrl: text('thumbnail_url'),
  thumbnailHash: text('thumbnail_hash'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  exif: text('exif', {mode: 'json'}).$type<NeededExif>()
})
