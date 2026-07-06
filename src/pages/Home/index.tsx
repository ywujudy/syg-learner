import logo from '@/assets/syg-logo.jpg'
import siyangeLink from '@/assets/siyangelink.jpg'
import AuthDialog from '@/components/AuthDialog'
import Footer from '@/components/Footer'
import { authUserAtom } from '@/store/authAtom'
import { Menu, Transition } from '@headlessui/react'
import { useAtom } from 'jotai'
import { Fragment, useState } from 'react'
import type React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

type ModuleCard = {
  key: string
  title: string
  description: string
  to?: string
  comingSoon?: boolean
  icon: string
}

const modules: ModuleCard[] = [
  {
    key: 'typing',
    title: '打字练习',
    description: '英语单词键盘练习，涵盖多套教材词库',
    to: '/typing',
    icon: '⌨️',
  },
  {
    key: 'room-booking',
    title: '会议室/学习室预约',
    description: '微信扫码进入预约平台，快速预订会议室与学习室',
    to: '/room-booking',
    icon: '📅',
  },
  {
    key: 'exam',
    title: '考试题库',
    description: 'A-Level / AP / IB / DSE / OSSD',
    to: '/exam',
    icon: '🎯',
  },
  {
    key: 'tree-hole',
    title: '树洞',
    description: '有不懂的学科问题可以提出，可以答疑解惑。',
    to: '/tree-hole',
    icon: '🌳',
  },
  {
    key: 'donate',
    title: '捐助',
    description: '支持思研阁的日常运营与内容创作',
    to: '/donate',
    icon: '💝',
  },
]

const Home: React.FC = () => {
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useAtom(authUserAtom)
  const navigate = useNavigate()

  const initial = user?.name?.slice(0, 1) ?? user?.phone?.slice(-2) ?? 'U'

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-indigo-200/40 via-transparent to-transparent dark:from-indigo-500/10" />

      <header className="container relative z-30 mx-auto flex w-full items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center">
          <img src={logo} className="mr-3 h-12 w-12 rounded-lg shadow-sm lg:h-14 lg:w-14" alt="思研阁 Logo" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 lg:text-2xl">思研阁</span>
            <span className="flex w-full justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400 lg:text-xs">
              <span>SI</span>
              <span>YAN</span>
              <span>GE</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center space-x-6 text-sm text-slate-600 dark:text-slate-300 lg:flex">
            <NavLink to="/donate" className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">
              捐助
            </NavLink>
            <a
              href="https://siyange.online"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-300"
              target="_blank"
              rel="noreferrer"
            >
              官网
            </a>
          </nav>

          {user ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {initial}
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="mb-0.5 text-sm font-medium text-slate-700 dark:text-slate-100">{user.name}</div>
                    {user.phone}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700" />
                  <a
                    href="/settings"
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-blue-100 hover:font-semibold hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-950/50 dark:hover:text-blue-200"
                  >
                    <span aria-hidden>⚙️</span>
                    设置
                  </a>
                  <div className="border-t border-slate-100 dark:border-slate-700" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => setUser(null)}
                        className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-300 ${
                          active ? 'bg-red-50 text-red-600 dark:bg-slate-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span aria-hidden>↩️</span>
                        退出登录
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-6 pb-20 lg:px-10">
        <section className="mx-auto max-w-3xl pb-14 pt-8 text-center lg:pb-20 lg:pt-16">
          <h1 className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-6xl">思研阁</h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-300 lg:text-lg">一个思考、研学的空间。</p>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const cardBase =
              'group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300'
            const active =
              'cursor-pointer border-blue-100 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500'
            const disabled = 'cursor-not-allowed border-slate-200 bg-white/60 opacity-70 dark:border-slate-700 dark:bg-slate-800/60'

            const content = (
              <>
                <div className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden>
                    {mod.icon}
                  </span>
                  {mod.comingSoon && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      即将上线
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{mod.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{mod.description}</p>
                </div>
                {!mod.comingSoon && (
                  <span className="absolute bottom-6 right-6 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-300">
                    进入 →
                  </span>
                )}
              </>
            )

            if (mod.to && !mod.comingSoon) {
              return (
                <NavLink key={mod.key} to={mod.to} className={`${cardBase} ${active}`}>
                  {content}
                </NavLink>
              )
            }
            return (
              <div key={mod.key} className={`${cardBase} ${disabled}`} aria-disabled>
                {content}
              </div>
            )
          })}

          <div className="relative flex h-48 items-center gap-4 overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <img
              src={siyangeLink}
              alt="思研阁联系二维码"
              className="h-full w-auto flex-shrink-0 rounded-lg object-contain"
            />
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">扫码联系思研阁</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">微信扫码，加入思研阁社区</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}

export default Home
