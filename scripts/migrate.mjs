#!/usr/bin/env node
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

/**
 * 基于 @adonisjs/hash 的 Scrypt 驱动程序兼容实现
 */
async function hashPassword(password) {
  const options = {
    cost: 16384, // N parameter (CPU/memory cost)
    blockSize: 8, // r parameter (block size)
    parallelization: 1, // p parameter (parallelization factor)
    keyLength: 64, // derived key length
    saltSize: 16, // salt size in bytes
  }

  const salt = randomBytes(options.saltSize)

  const derivedKey = await scryptAsync(password, salt, options.keyLength, {
    cost: options.cost,
    blockSize: options.blockSize,
    parallelization: options.parallelization,
  })

  // $scrypt$n=16384,r=8,p=1$salt$hash
  const saltBase64 = salt.toString('base64')
  const hashBase64 = derivedKey.toString('base64')

  return `$scrypt$n=${options.cost},r=${options.blockSize},p=${options.parallelization}$${saltBase64}$${hashBase64}`
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('Running database migrations...')

try {
  const sqlite = new Database(process.env.DATABASE_URL || './data/app.sqlite3')
  const db = drizzle(sqlite)

  migrate(db, {
    migrationsFolder: join(__dirname, '../server/database/migrations'),
  })

  const usersTable = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    username: text('name').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password'),
    avatar: text('avatar'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    isAdmin: integer('is_admin').default(0).notNull(),
  })

  const existingUsers = await db.select().from(usersTable)

  if (existingUsers.length === 0) {
    console.log('No users found, creating admin user...')
    const hashedPassword = await hashPassword(
      process.env.CFRAME_ADMIN_PASSWORD || 'CF1234@!',
    )

    await db.insert(usersTable).values({
      username: process.env.CFRAME_ADMIN_NAME || 'Chronoframe',
      email: process.env.CFRAME_ADMIN_EMAIL || 'admin@chronoframe.com', // This default email does not exist
      password: hashedPassword,
      createdAt: new Date(),
      isAdmin: 1,
    })
    console.log('Admin user created successfully.')
  } else {
    console.log('User already exists, skipping admin user creation.')
  }

  console.log('Database migrations completed successfully!')
  sqlite.close()
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
}
