import logo from '@/assets/syg-logo.jpg'
import Footer from '@/components/Footer'
import type React from 'react'
import { NavLink } from 'react-router-dom'

type ExamCard = {
  key: string
  title: string
  subtitle: string
  description: string
  to?: string
  comingSoon?: boolean
  icon: string
}

const exams: ExamCard[] = [
  {
    key: 'alevel',
    title: 'A-Level',
    subtitle: '英国普通中等教育证书高级课程',
    description: '英国高考，牛津剑桥等世界名校首选',
    icon: '🇬🇧',
    to: '/exam/alevel',
  },
  {
    key: 'ap',
    title: 'AP',
    subtitle: 'Advanced Placement',
    description: '美国大学先修课程，可抵美国大学学分',
    icon: '🇺🇸',
    comingSoon: true,
  },
  {
    key: 'ib',
    title: 'IB',
    subtitle: 'International Baccalaureate',
    description: '国际文凭课程，全球通行的名校敲门砖',
    icon: '🌍',
    comingSoon: true,
  },
  {
    key: 'dse',
    title: 'DSE',
    subtitle: '香港中学文凭考试',
    description: '香港高考，可申请全球多所大学',
    icon: '🇭🇰',
    comingSoon: true,
  },
  {
    key: 'ossd',
    title: 'OSSD',
    subtitle: '安大略省中学文凭',
    description: '加拿大安省高中课程，非应试评估',
    icon: '🇨🇦',
    comingSoon: true,
  },
]

const Exam: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-5xl">考试题库</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 lg:text-base">
            选择你正在准备的国际课程体系，进入对应的题库与真题演练。
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const cardBase =
              'group relative flex h-52 flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300'
            const active =
              'cursor-pointer border-blue-100 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500'
            const disabled = 'cursor-not-allowed border-slate-200 bg-white/60 opacity-70 dark:border-slate-700 dark:bg-slate-800/60'

            const content = (
              <>
                <div className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden>
                    {exam.icon}
                  </span>
                  {exam.comingSoon && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      即将上线
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{exam.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{exam.subtitle}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{exam.description}</p>
                </div>
                {!exam.comingSoon && (
                  <span className="absolute bottom-6 right-6 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-300">
                    进入 →
                  </span>
                )}
              </>
            )

            if (exam.to && !exam.comingSoon) {
              return (
                <NavLink key={exam.key} to={exam.to} className={`${cardBase} ${active}`}>
                  {content}
                </NavLink>
              )
            }
            return (
              <div key={exam.key} className={`${cardBase} ${disabled}`} aria-disabled>
                {content}
              </div>
            )
          })}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Exam
