import {
  BOOST_COST,
  ENERGY_PER_BAR,
  SKIN_COST,
  SKIN_MAX_LEVEL,
  boostChargesAtom,
  boostTriggerAtom,
  energyBarsAtom,
  energyPointsAtom,
  skinLevelAtom,
} from '../../store/energyAtom'
import { useAtom } from 'jotai'
import type React from 'react'
import { useState } from 'react'

const EnergyBox: React.FC = () => {
  const [points] = useAtom(energyPointsAtom)
  const [bars, setBars] = useAtom(energyBarsAtom)
  const [skin, setSkin] = useAtom(skinLevelAtom)
  const [charges, setCharges] = useAtom(boostChargesAtom)
  const [, setTrigger] = useAtom(boostTriggerAtom)
  const [expanded, setExpanded] = useState(true)
  const [flash, setFlash] = useState<string | null>(null)

  const flashMsg = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 1600)
  }

  const buyBoost = () => {
    if (bars < BOOST_COST) return
    setBars(bars - BOOST_COST)
    setCharges(charges + 1)
    flashMsg('+1 加速包')
  }

  const useBoost = () => {
    if (charges <= 0) return
    setCharges(charges - 1)
    setTrigger((n) => n + 1)
    flashMsg('弹射 +30% 路程')
  }

  const upgradeSkin = () => {
    if (bars < SKIN_COST || skin >= SKIN_MAX_LEVEL) return
    setBars(bars - SKIN_COST)
    setSkin(skin + 1)
    flashMsg(`皮肤升级 Lv${skin + 1}`)
  }

  return (
    <div className="fixed bottom-4 left-4 z-30 select-none">
      {flash && (
        <div className="animate__animated animate__fadeInUp animate__faster pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-lg dark:bg-blue-500">
          {flash}
        </div>
      )}
      <div
        className={`w-64 rounded-2xl border border-blue-200 bg-white/95 shadow-xl backdrop-blur transition-all dark:border-slate-700 dark:bg-slate-800/95 ${
          expanded ? 'p-3' : 'p-2'
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold text-blue-600 dark:text-blue-300"
        >
          <span className="flex items-center gap-1.5">
            <span aria-hidden>⚡</span>
            能量收集箱
          </span>
          <span className="text-xs text-slate-400">{expanded ? '收起' : '展开'}</span>
        </button>

        {expanded && (
          <>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>能量</span>
                <span>
                  {points} / {ENERGY_PER_BAR}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                  style={{ width: `${(points / ENERGY_PER_BAR) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-blue-50 py-1.5 dark:bg-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">能量棒</div>
                <div className="text-base font-semibold text-blue-600 dark:text-blue-300">{bars}</div>
              </div>
              <div className="rounded-lg bg-blue-50 py-1.5 dark:bg-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">加速包</div>
                <div className="text-base font-semibold text-orange-500">{charges}</div>
              </div>
              <div className="rounded-lg bg-blue-50 py-1.5 dark:bg-slate-700/50">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">皮肤</div>
                <div className="text-base font-semibold text-purple-600 dark:text-purple-300">Lv{skin}</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={bars < BOOST_COST}
                onClick={buyBoost}
                className="rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:dark:bg-slate-600"
              >
                兑 1 加速包（-{BOOST_COST}）
              </button>
              <button
                type="button"
                disabled={bars < SKIN_COST || skin >= SKIN_MAX_LEVEL}
                onClick={upgradeSkin}
                className="rounded-lg bg-purple-600 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:dark:bg-slate-600"
              >
                {skin >= SKIN_MAX_LEVEL ? '皮肤已顶级' : `皮肤升级（-${SKIN_COST}）`}
              </button>
            </div>

            <button
              type="button"
              disabled={charges <= 0}
              onClick={useBoost}
              className="mt-2 w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:dark:bg-slate-600"
            >
              🚀 启用加速包
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default EnergyBox
