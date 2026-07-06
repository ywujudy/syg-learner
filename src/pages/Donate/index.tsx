import logo from '@/assets/syg-logo.jpg'
import Footer from '@/components/Footer'
import { donationsAtom } from '@/store/donationAtom'
import { useAtom } from 'jotai'
import { QRCodeSVG } from 'qrcode.react'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

const PRESET_AMOUNTS = [10, 20, 50, 100, 200, 500]

type OrderStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

const WECHAT_LABEL = { label: '微信支付', color: 'text-green-600', icon: '💚' }

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const Donate: React.FC = () => {
  const [donations, setDonations] = useAtom(donationsAtom)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [qrCode, setQrCode] = useState<string | null>(null)
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null)
  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<number | null>(null)

  const ranked = useMemo(() => [...donations].sort((a, b) => b.amount - a.amount), [donations])
  const total = useMemo(() => donations.reduce((sum, d) => sum + d.amount, 0), [donations])

  const finalAmount = customAmount ? Number(customAmount) : amount

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [])

  const resetQr = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
    setQrCode(null)
    setOutTradeNo(null)
    setStatus(null)
  }

  const pollStatus = (tradeNo: string) => {
    if (pollRef.current) window.clearInterval(pollRef.current)
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/${tradeNo}/status`)
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'SUCCESS') {
          setStatus('SUCCESS')
          if (pollRef.current) {
            window.clearInterval(pollRef.current)
            pollRef.current = null
          }
          // 支付成功后写入本地排行榜
          setDonations([
            {
              id: tradeNo,
              name: name.trim() || '匿名',
              amount: Number(data.amount ?? finalAmount),
              message: message.trim() || undefined,
              createdAt: Date.now(),
            },
            ...donations,
          ])
        } else if (data.status === 'FAILED') {
          setStatus('FAILED')
          if (pollRef.current) {
            window.clearInterval(pollRef.current)
            pollRef.current = null
          }
        }
      } catch {
        // 后端没起时静默失败，避免弹错
      }
    }, 3000)
  }

  const generateQr = async () => {
    setError(null)
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      setError('请选择或输入有效的捐款金额')
      return
    }
    setLoading(true)
    resetQr()
    try {
      const res = await fetch('/api/donations/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          donor: name.trim() || '匿名',
          message: message.trim() || undefined,
          contact: contact.trim() || undefined,
          description: '思研阁捐助',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? '下单失败')
      }
      const data = await res.json()
      setQrCode(data.qrCode)
      setOutTradeNo(data.outTradeNo)
      setStatus('PENDING')
      pollStatus(data.outTradeNo)
    } catch (err) {
      setError(err instanceof Error ? err.message : '下单失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    generateQr()
  }

  useEffect(() => {
    if (qrCode && status === 'PENDING') {
      resetQr()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalAmount])

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-indigo-200/40 via-transparent to-transparent dark:from-indigo-500/10" />

      <header className="container relative z-10 mx-auto flex w-full items-center justify-between px-6 py-6 lg:px-10">
        <NavLink to="/" className="flex items-center">
          <img src={logo} className="mr-3 h-10 w-10 rounded-lg shadow-sm lg:h-12 lg:w-12" alt="思研阁 Logo" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 lg:text-xl">思研阁</span>
            <span className="flex w-full justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              <span>SI</span>
              <span>YAN</span>
              <span>GE</span>
            </span>
          </div>
        </NavLink>
        <NavLink
          to="/"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          返回首页
        </NavLink>
      </header>

      <main className="container relative z-10 mx-auto px-6 pb-16 lg:px-10">
        <section className="mx-auto max-w-3xl pb-10 pt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-5xl">支持思研阁</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 lg:text-base">
            您的每一份支持都将用于内容创作与服务维护。感谢您与我们一起，让思考与研学的空间持续成长。
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-3">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">马上捐款</h2>

            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">选择金额（元）</div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {PRESET_AMOUNTS.map((val) => {
                    const active = !customAmount && amount === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setAmount(val)
                          setCustomAmount('')
                        }}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="或输入自定义金额"
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">昵称（可选）</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  placeholder="将展示在排行榜，留空为「匿名」"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">留言（可选）</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="想说的话，我们会认真读到"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">联系方式（可选）</span>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={80}
                  placeholder="邮箱或手机号，方便后续联系"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>

              <div>
                <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">支付方式</div>
                <div className="flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  <span aria-hidden>{WECHAT_LABEL.icon}</span>
                  {WECHAT_LABEL.label}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading || status === 'PENDING'}
                className="rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? '正在生成支付码...'
                  : status === 'PENDING'
                  ? '请扫码支付'
                  : `生成 ${WECHAT_LABEL.label} 支付码（¥${Number.isFinite(finalAmount) && finalAmount > 0 ? finalAmount : 0}）`}
              </button>
            </form>
          </section>

          <aside className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">支付二维码</h2>

              {!qrCode && (
                <div className="flex h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400 dark:border-slate-700">
                  <div className="mb-2 text-4xl" aria-hidden>
                    📱
                  </div>
                  填写金额后点击「生成支付码」
                </div>
              )}

              {qrCode && status === 'PENDING' && (
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
                    <QRCodeSVG value={qrCode} size={200} level="M" />
                  </div>
                  <p className={`mt-3 text-sm font-medium ${WECHAT_LABEL.color}`}>
                    请使用 {WECHAT_LABEL.label} 扫码支付 ¥{finalAmount}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">订单号：{outTradeNo}</p>
                  <button type="button" onClick={resetQr} className="mt-3 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400">
                    取消并重新生成
                  </button>
                </div>
              )}

              {qrCode && status === 'SUCCESS' && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 text-5xl" aria-hidden>
                    🎉
                  </div>
                  <p className="text-base font-semibold text-blue-600 dark:text-blue-300">感谢您的捐赠！</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">您的支持已到账，我们会好好使用。</p>
                  <button
                    type="button"
                    onClick={resetQr}
                    className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    再捐一次
                  </button>
                </div>
              )}

              {qrCode && status === 'FAILED' && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 text-4xl" aria-hidden>
                    ⚠️
                  </div>
                  <p className="text-sm font-medium text-red-500">支付未成功，请重试。</p>
                  <button
                    type="button"
                    onClick={resetQr}
                    className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    重新生成
                  </button>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">二维码由拉卡拉聚合主扫接口动态生成，仅当次订单有效。</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">捐赠排行榜</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">累计 ¥{total}</span>
              </div>

              {ranked.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">还没有记录，欢迎成为第一位</p>
              ) : (
                <ol className="divide-y divide-slate-100 dark:divide-slate-700">
                  {ranked.map((d, idx) => (
                    <li key={d.id} className="flex items-center gap-3 py-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          idx === 0
                            ? 'bg-yellow-400 text-white'
                            : idx === 1
                            ? 'bg-slate-300 text-white'
                            : idx === 2
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{d.name}</div>
                        {d.message && <div className="truncate text-xs text-slate-400 dark:text-slate-500">{d.message}</div>}
                        <div className="text-xs text-slate-400 dark:text-slate-500">{formatDate(d.createdAt)}</div>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">¥{d.amount}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Donate
