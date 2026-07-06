import { neon } from '@neondatabase/serverless'

// 从 Vercel 环境变量取（在 Vercel Dashboard → Settings → Environment Variables 里配置）
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable')
}

export const sql = neon(connectionString)

// 简单的初始化标记：每个 serverless 实例首次访问 DB 时建表，后续跳过
let initialized = false

export async function ensureSchema() {
  if (initialized) return
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      last_login_at BIGINT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS verify_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_sent_at BIGINT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      author_phone TEXT NOT NULL,
      author_name TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      last_active_at BIGINT NOT NULL,
      reply_count INTEGER NOT NULL DEFAULT 0
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_last_active ON posts(last_active_at DESC)`

  await sql`
    CREATE TABLE IF NOT EXISTS replies (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_phone TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at BIGINT NOT NULL
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_replies_post ON replies(post_id, created_at)`

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      out_trade_no TEXT PRIMARY KEY,
      amount NUMERIC(10, 2) NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      code_url TEXT,
      donor TEXT,
      message TEXT,
      contact TEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `

  initialized = true
}

// 因为 Postgres 的 BIGINT 走 JS 会变成 string，这里统一转成 number 方便前端使用
export const toNumber = (v: unknown): number => (typeof v === 'string' ? Number(v) : (v as number))

export type UserRow = {
  id: number
  phone: string
  name: string
  created_at: number
  last_login_at: number
}

export type SessionRow = {
  token: string
  user_id: number
  created_at: number
  expires_at: number
}

export type VerifyCodeRow = {
  phone: string
  code: string
  expires_at: number
  attempts: number
  last_sent_at: number
}

export type PostRow = {
  id: number
  author_phone: string
  author_name: string
  title: string
  content: string
  created_at: number
  last_active_at: number
  reply_count: number
}

export type ReplyRow = {
  id: number
  post_id: number
  author_phone: string
  author_name: string
  content: string
  created_at: number
}

export type OrderRow = {
  out_trade_no: string
  amount: string
  description: string | null
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  code_url: string | null
  donor: string | null
  message: string | null
  contact: string | null
  created_at: number
  updated_at: number
}
