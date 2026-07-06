import { verifyAuth } from '../../lib/auth.js'
import { sql } from '../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await verifyAuth(req)
  if (!user) return res.json({ ok: true })
  const header = (req.headers.authorization ?? '').toString()
  const m = header.match(/^Bearer\s+(\S+)$/i)
  if (m) await sql`DELETE FROM sessions WHERE token = ${m[1]}`
  return res.json({ ok: true })
}
