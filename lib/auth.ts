import { ensureSchema, sql, type UserRow } from './db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'

export const PHONE_RE = /^1[3-9]\d{9}$/
export const RESEND_INTERVAL = 60_000 // 60s
export const CODE_TTL = 5 * 60_000 // 5 min
export const MAX_ATTEMPTS = 5
export const SESSION_TTL = 30 * 24 * 3600 * 1000 // 30 days

export const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()
export const generateToken = () => crypto.randomBytes(32).toString('hex')

export async function verifyAuth(req: VercelRequest): Promise<UserRow | null> {
  const header = (req.headers.authorization ?? '').toString()
  const m = header.match(/^Bearer\s+(\S+)$/i)
  if (!m) return null
  const token = m[1]
  await ensureSchema()
  const now = Date.now()
  const rows = (await sql`
    SELECT u.* FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > ${now}
    LIMIT 1
  `) as UserRow[]
  return rows[0] ?? null
}

export function requireAuth(res: VercelResponse, user: UserRow | null): user is UserRow {
  if (!user) {
    res.status(401).json({ error: '请先登录' })
    return false
  }
  return true
}

export function readJson<T = unknown>(req: VercelRequest): T {
  const body = req.body
  if (!body) return {} as T
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T
    } catch {
      return {} as T
    }
  }
  return body as T
}
