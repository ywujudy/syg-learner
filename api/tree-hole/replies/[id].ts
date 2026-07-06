import { requireAuth, verifyAuth } from '../../../lib/auth.js'
import { ensureSchema, sql, type ReplyRow } from '../../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: '无效的回复 id' })
  const user = await verifyAuth(req)
  if (!requireAuth(res, user)) return

  await ensureSchema()
  const reply = ((await sql`SELECT * FROM replies WHERE id = ${id} LIMIT 1`) as ReplyRow[])[0]
  if (!reply) return res.status(404).json({ error: '回复不存在' })
  if (reply.author_phone !== user.phone) return res.status(403).json({ error: '只能删除自己发布的回复' })
  await sql`DELETE FROM replies WHERE id = ${id}`
  await sql`UPDATE posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = ${reply.post_id}`
  return res.json({ ok: true })
}
