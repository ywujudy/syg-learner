import crypto from 'node:crypto'

// 腾讯云 SMS API v3 (TC3-HMAC-SHA256) 直连，避免 SDK 依赖。
// 文档：https://cloud.tencent.com/document/api/382/55981

const TENCENT_HOST = 'sms.tencentcloudapi.com'
const ACTION = 'SendSms'
const VERSION = '2021-01-11'
const SERVICE = 'sms'

type SendCodeArgs = { phone: string; code: string }
type SendCodeResult = { mode: 'dev' | 'tencent'; devCode?: string }

const hmac = (key: Buffer | string, msg: string) => crypto.createHmac('sha256', key).update(msg, 'utf8').digest()
const sha256hex = (msg: string) => crypto.createHash('sha256').update(msg, 'utf8').digest('hex')

const utcDate = (timestampSec: number) => {
  const d = new Date(timestampSec * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const buildAuthorization = (opts: { secretId: string; secretKey: string; timestamp: number; body: string }) => {
  const { secretId, secretKey, timestamp, body } = opts
  const date = utcDate(timestamp)
  const payloadHash = sha256hex(body)
  const canonicalHeaders =
    `content-type:application/json; charset=utf-8\n` + `host:${TENCENT_HOST}\n` + `x-tc-action:${ACTION.toLowerCase()}\n`
  const signedHeaders = 'content-type;host;x-tc-action'
  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
  const credentialScope = `${date}/${SERVICE}/tc3_request`
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${sha256hex(canonicalRequest)}`
  const kDate = hmac(`TC3${secretKey}`, date)
  const kService = hmac(kDate, SERVICE)
  const kSigning = hmac(kService, 'tc3_request')
  const signature = hmac(kSigning, stringToSign).toString('hex')
  return `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

export const sendSmsCode = async ({ phone, code }: SendCodeArgs): Promise<SendCodeResult> => {
  const secretId = process.env.TENCENT_SECRET_ID?.trim()
  const secretKey = process.env.TENCENT_SECRET_KEY?.trim()
  const sdkAppId = process.env.TENCENT_SMS_SDK_APP_ID?.trim()
  const signName = process.env.TENCENT_SMS_SIGN?.trim()
  const templateId = process.env.TENCENT_SMS_TEMPLATE_ID?.trim()
  const region = process.env.TENCENT_SMS_REGION?.trim() || 'ap-guangzhou'

  const configured = !!(secretId && secretKey && sdkAppId && signName && templateId)
  // 生产环境需要显式设置 SMS_DEV_MODE=1 才允许走 dev fallback（任何人拿走任意手机号验证码）
  const devAllowed = process.env.VERCEL_ENV !== 'production' || process.env.SMS_DEV_MODE === '1'
  if (!configured) {
    if (!devAllowed) {
      throw new Error('腾讯云短信未配置，无法在生产环境发送验证码')
    }
    console.log(`[sms:dev] phone=${phone} code=${code}`)
    return { mode: 'dev', devCode: code }
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const body = JSON.stringify({
    PhoneNumberSet: [`+86${phone}`],
    SmsSdkAppId: sdkAppId,
    SignName: signName,
    TemplateId: templateId,
    TemplateParamSet: [code],
  })
  const authorization = buildAuthorization({ secretId: secretId!, secretKey: secretKey!, timestamp, body })

  const res = await fetch(`https://${TENCENT_HOST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Host: TENCENT_HOST,
      'X-TC-Action': ACTION,
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Version': VERSION,
      'X-TC-Region': region,
      Authorization: authorization,
    },
    body,
  })
  const data = (await res.json().catch(() => ({}))) as {
    Response?: { Error?: { Code: string; Message: string }; SendStatusSet?: Array<{ Code: string; Message: string }> }
  }
  const resp = data.Response ?? {}
  if (resp.Error) throw new Error(`${resp.Error.Code}: ${resp.Error.Message}`)
  const status = resp.SendStatusSet?.[0]
  if (!status) throw new Error('短信发送响应异常')
  if (status.Code !== 'Ok') throw new Error(`${status.Code}: ${status.Message}`)
  return { mode: 'tencent' }
}
