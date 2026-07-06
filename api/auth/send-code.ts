import { CODE_TTL, PHONE_RE, RESEND_INTERVAL, generateCode, readJson } from '../../lib/auth.js'
import { ensureSchema, sql, type VerifyCodeRow } from '../../lib/db.js'
import { sendSmsCode } from '../../lib/sms.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const body = readJson<{ phone?: string }>(req)
  const phone = (body.phone ?? '').toString().trim()
  if (!PHONE_RE.test(phone)) return res.status(400).json({ error: '请输入正确的手机号' })

  await ensureSchema()
  const now = Date.now()
  const existing = ((await sql`SELECT * FROM verify_codes WHERE phone = ${phone} LIMIT 1`) as VerifyCodeRow[])[0]
  if (existing && now - Number(existing.last_sent_at) < RESEND_INTERVAL) {
    const wait = Math.ceil((RESEND_INTERVAL - (now - Number(existing.last_sent_at))) / 1000)
    return res.status(429).json({ error: `请 ${wait} 秒后重试` })
  }

  const code = generateCode()
  const expiresAt = now + CODE_TTL
  await sql`
    INSERT INTO verify_codes (phone, code, expires_at, attempts, last_sent_at)
    VALUES (${phone}, ${code}, ${expiresAt}, 0, ${now})
    ON CONFLICT (phone) DO UPDATE SET
      code = EXCLUDED.code,
      expires_at = EXCLUDED.expires_at,
      attempts = 0,
      last_sent_at = EXCLUDED.last_sent_at
  `

  try {
    const result = await sendSmsCode({ phone, code })
    return res.json({
      ok: true,
      mode: result.mode,
      devCode: result.mode === 'dev' ? result.devCode : undefined,
    })
  } catch (err) {
    console.error('sms send failed:', err)
    await sql`DELETE FROM verify_codes WHERE phone = ${phone}`
    return res.status(500).json({ error: err instanceof Error ? err.message : '短信发送失败' })
  }
}
