import qrImage from '@/assets/huiyishiyuyue.jpg'
import logo from '@/assets/syg-logo.jpg'
import Footer from '@/components/Footer'
import type React from 'react'
import { NavLink } from 'react-router-dom'

const RoomBooking: React.FC = () => {
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

      <main className="container relative z-10 mx-auto max-w-3xl px-6 pb-16 lg:px-10">
        <section className="pb-8 pt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-5xl">会议室 / 学习室预约</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 lg:text-base">
            使用微信扫描下方二维码，进入思研阁会议室 / 学习室预约平台，选择合适的时段与空间。
          </p>
        </section>

        <section className="mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col items-center">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
              <img src={qrImage} alt="会议室/学习室预约二维码" className="h-64 w-64 object-contain sm:h-72 sm:w-72" />
            </div>
            <p className="mt-5 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
              打开微信「扫一扫」，扫描二维码即可进入预约
            </p>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">二维码由思研阁提供，仅用于预约会议室与学习室</p>
          </div>
        </section>

        <section className="mx-auto mt-6 max-w-md rounded-2xl border border-blue-100 bg-white/70 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">使用说明</h2>
          <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed">
            <li>打开微信，点击右上角「+」选择「扫一扫」。</li>
            <li>对准上方二维码扫描，进入思研阁预约平台。</li>
            <li>选择日期、时段与目标房间，提交预约信息即可。</li>
            <li>预约成功后请按时到场，如有变动请提前取消，方便他人使用。</li>
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default RoomBooking
