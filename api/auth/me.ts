import { requireAuth, verifyAuth } from '../../lib/auth.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await verifyAuth(req)
  if (!requireAuth(res, user)) return
  return res.json({
    user: { phone: user.phone, name: user.name, loggedInAt: Number(user.last_login_at) },
  })
}
