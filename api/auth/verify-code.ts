import { MAX_ATTEMPTS, PHONE_RE, SESSION_TTL, generateToken, readJson } from '../../lib/auth.js'
import { ensureSchema, sql, type UserRow, type VerifyCodeRow } from '../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const body = readJson<{ phone?: string; code?: string }>(req)
  const phone = (body.phone ?? '').toString().trim()
  const code = (body.code ?? '').toString().trim()
  if (!PHONE_RE.test(phone)) return res.status(400).json({ error: '请输入正确的手机号' })
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: '请输入 6 位数字验证码' })

  await ensureSchema()
  const now = Date.now()
  const row = ((await sql`SELECT * FROM verify_codes WHERE phone = ${phone} LIMIT 1`) as VerifyCodeRow[])[0]
  if (!row) return res.status(400).json({ error: '请先获取验证码' })
  if (Number(row.expires_at) <= now) {
    await sql`DELETE FROM verify_codes WHERE phone = ${phone}`
    return res.status(400).json({ error: '验证码已过期，请重新获取' })
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await sql`DELETE FROM verify_codes WHERE phone = ${phone}`
    return res.status(400).json({ error: '验证次数过多，请重新获取验证码' })
  }
  if (row.code !== code) {
    await sql`UPDATE verify_codes SET attempts = attempts + 1 WHERE phone = ${phone}`
    return res.status(400).json({ error: '验证码错误' })
  }

  await sql`DELETE FROM verify_codes WHERE phone = ${phone}`
  await sql`DELETE FROM sessions WHERE expires_at <= ${now}`

  let user = ((await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`) as UserRow[])[0]
  if (!user) {
    const name = `用户${phone.slice(-4)}`
    user = (
      (await sql`
        INSERT INTO users (phone, name, created_at, last_login_at)
        VALUES (${phone}, ${name}, ${now}, ${now})
        RETURNING *
      `) as UserRow[]
    )[0]
  } else {
    await sql`UPDATE users SET last_login_at = ${now} WHERE id = ${user.id}`
  }
  if (!user) return res.status(500).json({ error: '用户创建失败' })

  const token = generateToken()
  await sql`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (${token}, ${user.id}, ${now}, ${now + SESSION_TTL})
  `

  return res.json({
    token,
    user: { phone: user.phone, name: user.name, loggedInAt: now },
  })
}
