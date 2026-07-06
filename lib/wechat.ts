import crypto from 'node:crypto'

const WX_HOST = 'https://api.mch.weixin.qq.com'

const normalizeKey = (raw: string) => raw.replace(/\\n/g, '\n').trim()

export function signRequest(params: {
  method: string
  urlPath: string
  timestamp: string
  nonceStr: string
  body: string
  privateKeyPem: string
}): string {
  const message = `${params.method}\n${params.urlPath}\n${params.timestamp}\n${params.nonceStr}\n${params.body}\n`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(message, 'utf8')
  signer.end()
  return signer.sign(normalizeKey(params.privateKeyPem), 'base64')
}

export function buildAuthorization(params: {
  method: string
  urlPath: string
  body: string
  mchid: string
  serialNo: string
  privateKeyPem: string
}): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonceStr = crypto.randomBytes(16).toString('hex')
  const signature = signRequest({ ...params, timestamp, nonceStr })
  return `WECHATPAY2-SHA256-RSA2048 mchid="${params.mchid}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${params.serialNo}",signature="${signature}"`
}

export function verifyNotify(params: {
  timestamp: string
  nonce: string
  body: string
  signature: string
  platformCertPem: string
}): boolean {
  const message = `${params.timestamp}\n${params.nonce}\n${params.body}\n`
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(message, 'utf8')
  verifier.end()
  return verifier.verify(normalizeKey(params.platformCertPem), params.signature, 'base64')
}

export function decryptNotifyResource(params: { ciphertext: string; associatedData: string; nonce: string; apiV3Key: string }): string {
  const buf = Buffer.from(params.ciphertext, 'base64')
  const authTag = buf.subarray(buf.length - 16)
  const data = buf.subarray(0, buf.length - 16)
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(params.apiV3Key, 'utf8'), Buffer.from(params.nonce, 'utf8'))
  decipher.setAuthTag(authTag)
  decipher.setAAD(Buffer.from(params.associatedData, 'utf8'))
  const plain = Buffer.concat([decipher.update(data), decipher.final()])
  return plain.toString('utf8')
}

export type NativeOrderInput = {
  outTradeNo: string
  totalFen: number
  description: string
  notifyUrl: string
}

export type NativeOrderResult = {
  codeUrl: string
  outTradeNo: string
}

export async function createNativeOrder(input: NativeOrderInput): Promise<NativeOrderResult> {
  const appId = process.env.WX_APPID ?? ''
  const mchid = process.env.WX_MCHID ?? ''
  const serialNo = process.env.WX_CERT_SERIAL ?? ''
  const privateKey = process.env.WX_PRIVATE_KEY ?? ''
  const urlPath = '/v3/pay/transactions/native'
  const body = JSON.stringify({
    appid: appId,
    mchid,
    description: input.description,
    out_trade_no: input.outTradeNo,
    notify_url: input.notifyUrl,
    amount: { total: input.totalFen, currency: 'CNY' },
  })
  const authorization = buildAuthorization({
    method: 'POST',
    urlPath,
    body,
    mchid,
    serialNo,
    privateKeyPem: privateKey,
  })
  const res = await fetch(`${WX_HOST}${urlPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authorization,
      'User-Agent': 'siyange-server/0.1',
    },
    body,
  })
  const text = await res.text()
  let data: any
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`微信响应非 JSON：${text}`)
  }
  if (!res.ok) throw new Error(`微信下单失败 ${res.status}：${data?.message ?? text}`)
  if (!data.code_url) throw new Error('微信响应缺少 code_url')
  return { codeUrl: data.code_url, outTradeNo: input.outTradeNo }
}
