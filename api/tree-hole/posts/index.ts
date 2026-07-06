import { readJson, requireAuth, verifyAuth } from '../../../lib/auth.js'
import { ensureSchema, sql, type PostRow } from '../../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const TITLE_MAX = 80
const CONTENT_MAX = 2000
const PAGE_SIZE = 20

const serialize = (row: PostRow) => ({
  id: row.id,
  authorPhone: row.author_phone,
  authorName: row.author_name,
  title: row.title,
  content: row.content,
  createdAt: Number(row.created_at),
  lastActiveAt: Number(row.last_active_at),
  replyCount: row.reply_count,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema()

  if (req.method === 'GET') {
    const page = Math.max(1, Number(req.query.page) || 1)
    const offset = (page - 1) * PAGE_SIZE
    const totalRow = (await sql`SELECT COUNT(*)::int AS c FROM posts`) as Array<{ c: number }>
    const total = totalRow[0]?.c ?? 0
    const rows = (await sql`
      SELECT * FROM posts ORDER BY last_active_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `) as PostRow[]
    return res.json({ page, pageSize: PAGE_SIZE, total, posts: rows.map(serialize) })
  }

  if (req.method === 'POST') {
    const user = await verifyAuth(req)
    if (!requireAuth(res, user)) return
    const body = readJson<{ title?: string; content?: string }>(req)
    const title = (body.title ?? '').toString().trim()
    const content = (body.content ?? '').toString().trim()
    if (!title) return res.status(400).json({ error: '请输入标题' })
    if (title.length > TITLE_MAX) return res.status(400).json({ error: `标题不能超过 ${TITLE_MAX} 字` })
    if (!content) return res.status(400).json({ error: '请输入正文' })
    if (content.length > CONTENT_MAX) return res.status(400).json({ error: `正文不能超过 ${CONTENT_MAX} 字` })
    const now = Date.now()
    const rows = (await sql`
      INSERT INTO posts (author_phone, author_name, title, content, created_at, last_active_at, reply_count)
      VALUES (${user.phone}, ${user.name}, ${title}, ${content}, ${now}, ${now}, 0)
      RETURNING *
    `) as PostRow[]
    return res.json(serialize(rows[0]))
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
