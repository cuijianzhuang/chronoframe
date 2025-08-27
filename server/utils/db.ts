// import { drizzle } from 'drizzle-orm/d1'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDB() {
  // return drizzle(hubDatabase(), { schema })
  const sqlite = new Database('data/app.sqlite3')
  return drizzle(sqlite, { schema })
}

export type User = typeof schema.users.$inferSelect
export type Photo = typeof schema.photos.$inferSelect
