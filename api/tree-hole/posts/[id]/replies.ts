import { readJson, requireAuth, verifyAuth } from '../../../../lib/auth.js'
import { ensureSchema, sql, type PostRow, type ReplyRow } from '../../../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const REPLY_MAX = 1000

const serialize = (row: ReplyRow) => ({
  id: row.id,
  postId: row.post_id,
  authorPhone: row.author_phone,
  authorName: row.author_name,
  content: row.content,
  createdAt: Number(row.created_at),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: '无效的帖子 id' })

  const user = await verifyAuth(req)
  if (!requireAuth(res, user)) return

  const body = readJson<{ content?: string }>(req)
  const content = (body.content ?? '').toString().trim()
  if (!content) return res.status(400).json({ error: '回复内容不能为空' })
  if (content.length > REPLY_MAX) return res.status(400).json({ error: `回复不能超过 ${REPLY_MAX} 字` })

  await ensureSchema()
  const post = ((await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`) as PostRow[])[0]
  if (!post) return res.status(404).json({ error: '帖子不存在' })

  const now = Date.now()
  const rows = (await sql`
    INSERT INTO replies (post_id, author_phone, author_name, content, created_at)
    VALUES (${id}, ${user.phone}, ${user.name}, ${content}, ${now})
    RETURNING *
  `) as ReplyRow[]
  await sql`UPDATE posts SET reply_count = reply_count + 1, last_active_at = ${now} WHERE id = ${id}`

  return res.json(serialize(rows[0]))
}
