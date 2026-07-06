import { ensureSchema, sql, type OrderRow } from '../../../lib/db.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const outTradeNo = String(req.query.outTradeNo ?? '')
  await ensureSchema()
  const rows = (await sql`SELECT * FROM orders WHERE out_trade_no = ${outTradeNo} LIMIT 1`) as OrderRow[]
  const order = rows[0]
  if (!order) return res.status(404).json({ error: '订单不存在' })
  return res.json({
    outTradeNo: order.out_trade_no,
    status: order.status,
    amount: Number(order.amount),
  })
}
