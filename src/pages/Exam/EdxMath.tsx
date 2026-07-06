import papersJson from './edx-math-papers.json'
import logo from '@/assets/syg-logo.jpg'
import Footer from '@/components/Footer'
import type React from 'react'
import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'

type Paper = {
  id: string
  unit: string
  year: number
  month: number
  type: 'QP' | 'MS' | string
  variant: 'R' | null
  fileName: string
  url: string
}

const ALL = 'ALL'
const papers = papersJson as Paper[]

const unitOptions = Array.from(new Set(papers.map((p) => p.unit))).sort()
const yearOptions = Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a)
const monthOptions = Array.from(new Set(papers.map((p) => p.month))).sort((a, b) => a - b)
const typeOptions = Array.from(new Set(papers.map((p) => p.type))).sort()

const monthLabel = (m: number) => `${m}月`

const EdxMath: React.FC = () => {
  const [unit, setUnit] = useState<string>(ALL)
  const [year, setYear] = useState<string>(ALL)
  const [month, setMonth] = useState<string>(ALL)
  const [type, setType] = useState<string>(ALL)
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      if (unit !== ALL && p.unit !== unit) return false
      if (year !== ALL && String(p.year) !== year) return false
      if (month !== ALL && String(p.month) !== month) return false
      if (type !== ALL && p.type !== type) return false
      if (keyword && !p.fileName.toLowerCase().includes(keyword.toLowerCase())) return false
      return true
    })
  }, [unit, year, month, type, keyword])

  const reset = () => {
    setUnit(ALL)
    setYear(ALL)
    setMonth(ALL)
    setType(ALL)
    setKeyword('')
  }

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
        <div className="flex items-center gap-2">
          <NavLink
            to="/exam/alevel"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            返回 A-Level
          </NavLink>
          <NavLink
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            返回首页
          </NavLink>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-6 pb-16 lg:px-10">
        <section className="mx-auto max-w-3xl pb-8 pt-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-4xl">Edexcel · 数学历年真题</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            覆盖 P1-P4、FP1-FP3、M1-M3、S1-S3、D1，含最新 2025 年 1 月真题。
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              单元
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={ALL}>全部单元</option>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              年份
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={ALL}>全部年份</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              月份
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={ALL}>全部月份</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              类型
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={ALL}>QP + MS</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t === 'QP' ? '试卷 QP' : t === 'MS' ? '答案 MS' : t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
              关键字
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜文件名"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              共 <span className="font-semibold text-blue-600 dark:text-blue-300">{filtered.length}</span> 份匹配（ 总计 {papers.length}{' '}
              份）
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
            >
              重置筛选
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-blue-50 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left">单元</th>
                  <th className="px-4 py-2 text-left">年月</th>
                  <th className="px-4 py-2 text-left">类型</th>
                  <th className="px-4 py-2 text-left">文件</th>
                  <th className="px-4 py-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      没有匹配的真题
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:bg-slate-700/40"
                    >
                      <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{p.unit}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        {p.year} / {monthLabel(p.month)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.type === 'QP'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {p.type === 'QP' ? '试卷' : p.type === 'MS' ? '答案' : p.type}
                          {p.variant === 'R' && (
                            <span className="rounded bg-amber-100 px-1 text-[10px] text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                              R
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-slate-500 dark:text-slate-400">{p.fileName}</td>
                      <td className="px-4 py-2 text-right">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-2 inline-block rounded border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                          在线预览
                        </a>
                        <a
                          href={p.url}
                          download={p.fileName}
                          className="inline-block rounded border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                        >
                          下载
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default EdxMath
