import { ensureSchema, sql } from '../../lib/db.js'
import { decryptNotifyResource, verifyNotify } from '../../lib/wechat.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: {
    bodyParser: false, // 我们要拿 raw body 验签
  },
}

const readRawBody = (req: VercelRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'FAIL', message: 'Method not allowed' })
  await ensureSchema()

  try {
    const timestamp = String(req.headers['wechatpay-timestamp'] ?? '')
    const nonce = String(req.headers['wechatpay-nonce'] ?? '')
    const signature = String(req.headers['wechatpay-signature'] ?? '')
    const platformCert = process.env.WX_PLATFORM_CERT ?? ''
    const apiV3Key = process.env.WX_APIV3_KEY ?? ''

    const rawBody = await readRawBody(req)

    if (platformCert && signature) {
      const ok = verifyNotify({ timestamp, nonce, body: rawBody, signature, platformCertPem: platformCert })
      if (!ok) {
        console.warn('微信回调验签失败')
        return res.status(401).json({ code: 'FAIL', message: 'sign fail' })
      }
    }

    const parsed = rawBody ? JSON.parse(rawBody) : {}
    const resource = parsed?.resource
    if (!resource || !apiV3Key) {
      return res.status(400).json({ code: 'FAIL', message: 'missing resource' })
    }

    const plain = decryptNotifyResource({
      ciphertext: resource.ciphertext,
      associatedData: resource.associated_data ?? '',
      nonce: resource.nonce,
      apiV3Key,
    })
    const data = JSON.parse(plain)
    const outTradeNo: string = data.out_trade_no
    const tradeState: string = data.trade_state

    let status: 'SUCCESS' | 'FAILED' | null = null
    if (tradeState === 'SUCCESS') status = 'SUCCESS'
    else if (['CLOSED', 'REVOKED', 'PAYERROR'].includes(tradeState)) status = 'FAILED'

    if (status) {
      await sql`UPDATE orders SET status = ${status}, updated_at = ${Date.now()} WHERE out_trade_no = ${outTradeNo}`
    }
    return res.json({ code: 'SUCCESS', message: 'OK' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ code: 'FAIL', message: err instanceof Error ? err.message : 'error' })
  }
}
