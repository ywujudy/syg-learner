import { requireAuth, verifyAuth } from '../../../../lib/auth.js'
import { ensureSchema, sql, type PostRow, type ReplyRow } from '../../../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const serializePost = (row: PostRow) => ({
  id: row.id,
  authorPhone: row.author_phone,
  authorName: row.author_name,
  title: row.title,
  content: row.content,
  createdAt: Number(row.created_at),
  lastActiveAt: Number(row.last_active_at),
  replyCount: row.reply_count,
})

const serializeReply = (row: ReplyRow) => ({
  id: row.id,
  postId: row.post_id,
  authorPhone: row.author_phone,
  authorName: row.author_name,
  content: row.content,
  createdAt: Number(row.created_at),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: '无效的帖子 id' })
  await ensureSchema()

  if (req.method === 'GET') {
    const post = ((await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`) as PostRow[])[0]
    if (!post) return res.status(404).json({ error: '帖子不存在' })
    const replies = (await sql`
      SELECT * FROM replies WHERE post_id = ${id} ORDER BY created_at ASC
    `) as ReplyRow[]
    return res.json({ post: serializePost(post), replies: replies.map(serializeReply) })
  }

  if (req.method === 'DELETE') {
    const user = await verifyAuth(req)
    if (!requireAuth(res, user)) return
    const post = ((await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`) as PostRow[])[0]
    if (!post) return res.status(404).json({ error: '帖子不存在' })
    if (post.author_phone !== user.phone) return res.status(403).json({ error: '只能删除自己发布的帖子' })
    await sql`DELETE FROM posts WHERE id = ${id}`
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
