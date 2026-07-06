import logo from '@/assets/syg-logo.jpg'
import Footer from '@/components/Footer'
import { energyBarsAtom } from '@/pages/Typing/store/energyAtom'
import { REDEEM_CODES, redeemedCodesAtom } from '@/store/redeemAtom'
import { useAtom } from 'jotai'
import type React from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const Settings: React.FC = () => {
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [redeemed, setRedeemed] = useAtom(redeemedCodesAtom)
  const [bars, setBars] = useAtom(energyBarsAtom)

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    const normalized = code.trim().toUpperCase()
    if (!normalized) {
      setFeedback({ type: 'error', msg: '请输入兑换码' })
      return
    }
    if (redeemed.includes(normalized)) {
      setFeedback({ type: 'error', msg: '该兑换码已使用过' })
      return
    }
    const reward = REDEEM_CODES[normalized]
    if (!reward) {
      setFeedback({ type: 'error', msg: '兑换码无效' })
      return
    }

    setBars(bars + reward)
    setRedeemed([...redeemed, normalized])
    setFeedback({ type: 'success', msg: `兑换成功！+${reward} 根能量棒` })
    setCode('')
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
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
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-4xl">设置</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">账号相关配置与兑换福利。</p>
        </section>

        <div className="mx-auto max-w-2xl space-y-6">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">兑换码</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              输入兑换码可获得能量棒奖励。同一兑换码在本设备上只能使用一次。
            </p>

            <form onSubmit={handleRedeem} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入兑换码"
                maxLength={32}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                立即兑换
              </button>
            </form>

            {feedback && (
              <p
                className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {feedback.msg}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>当前能量棒</span>
              <span className="font-semibold text-blue-600 dark:text-blue-300">{bars} 根</span>
            </div>
          </section>

          {redeemed.length > 0 && (
            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">已使用的兑换码</h2>
              <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                {redeemed.map((c) => (
                  <li key={c} className="font-mono">
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Settings
