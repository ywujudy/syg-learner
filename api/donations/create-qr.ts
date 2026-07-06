import { readJson } from '../../lib/auth.js'
import { ensureSchema, sql } from '../../lib/db.js'
import { createNativeOrder } from '../../lib/wechat.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  await ensureSchema()

  try {
    const body = readJson<{
      amount?: number
      donor?: string
      message?: string
      contact?: string
      description?: string
    }>(req)
    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: '金额无效' })

    const outTradeNo = `SYG${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const totalFen = Math.round(amount * 100)
    const description = body.description ?? '思研阁捐助'

    const result = await createNativeOrder({
      outTradeNo,
      totalFen,
      description,
      notifyUrl: process.env.WX_NOTIFY_URL ?? '',
    })

    const now = Date.now()
    await sql`
      INSERT INTO orders (out_trade_no, amount, description, status, code_url, donor, message, contact, created_at, updated_at)
      VALUES (${outTradeNo}, ${amount}, ${description}, 'PENDING', ${result.codeUrl}, ${body.donor ?? null}, ${body.message ?? null}, ${
      body.contact ?? null
    }, ${now}, ${now})
    `
    return res.json({ outTradeNo, qrCode: result.codeUrl })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err instanceof Error ? err.message : '下单失败' })
  }
}
