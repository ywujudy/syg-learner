import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { authUserAtom } from '@/store/authAtom'
import { useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'

const PHONE_REGEX = /^1[3-9]\d{9}$/
const COUNTDOWN_SECONDS = 60

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SendCodeResp = { ok: boolean; mode?: 'dev' | 'tencent'; devCode?: string; error?: string }
type VerifyCodeResp = {
  token: string
  user: { phone: string; name: string; loggedInAt: number }
  error?: string
}

// eslint-disable-next-line react/prop-types
const AuthDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const setUser = useSetAtom(authUserAtom)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sentHint, setSentHint] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) {
      setPhone('')
      setCode('')
      setError(null)
      setCountdown(0)
      setSentHint(null)
      setSending(false)
      setSubmitting(false)
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const startCountdown = () => {
    setCountdown(COUNTDOWN_SECONDS)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    setError(null)
    setSentHint(null)
    if (!PHONE_REGEX.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = (await res.json().catch(() => ({}))) as SendCodeResp
      if (!res.ok) throw new Error(data.error ?? '发送失败，请稍后再试')
      if (data.mode === 'dev' && data.devCode) {
        setSentHint(`开发模式：验证码 ${data.devCode}（未配置腾讯云短信时直接返回）`)
      } else {
        setSentHint('验证码已发送至您的手机')
      }
      startCountdown()
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!PHONE_REGEX.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setError('请输入 6 位数字验证码')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      const data = (await res.json().catch(() => ({}))) as VerifyCodeResp
      if (!res.ok) throw new Error(data.error ?? '登录失败')
      setUser({
        phone: data.user.phone,
        name: data.user.name,
        loggedInAt: data.user.loggedInAt,
        token: data.token,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>登录 / 注册</DialogTitle>
          <DialogDescription>使用手机号 + 短信验证码登录，新用户将自动创建账号。</DialogDescription>
        </DialogHeader>

        <form className="mt-2 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">手机号</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入 11 位手机号"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">验证码</span>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6 位数字验证码"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending || countdown > 0}
                className="min-w-[110px] rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
              >
                {countdown > 0 ? `${countdown}s 后重发` : sending ? '发送中...' : '获取验证码'}
              </button>
            </div>
          </label>

          {sentHint && <p className="text-xs text-slate-500 dark:text-slate-400">{sentHint}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? '登录中...' : '登录 / 注册'}
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">登录即表示同意《用户协议》和《隐私政策》</p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog
