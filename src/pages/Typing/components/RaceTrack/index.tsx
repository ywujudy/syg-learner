import { TypingContext } from '../../store'
import { BOOST_DISTANCE, boostTriggerAtom, energyBarsAtom, skinLevelAtom } from '../../store/energyAtom'
import { letterProgressAtom } from './atom'
import { useAtomValue, useSetAtom } from 'jotai'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

type Opponent = {
  name: string
  bodyColor: string
  accentColor: string
  wpm: number
}

const OPPONENTS: Opponent[] = [
  { name: 'TurboKey', bodyColor: '#ef4444', accentColor: '#7f1d1d', wpm: 38 },
  { name: 'WordHawk', bodyColor: '#a855f7', accentColor: '#581c87', wpm: 52 },
  { name: 'KeyDash', bodyColor: '#22c55e', accentColor: '#14532d', wpm: 28 },
]

// 皮肤等级 → 车身配色。Lv1 蓝、Lv2 绿、Lv3 紫、Lv4 橙金、Lv5 红金
const SKIN_STYLES: Record<number, { bodyColor: string; accentColor: string; badge: string }> = {
  1: { bodyColor: '#3b82f6', accentColor: '#1e3a8a', badge: 'Lv1' },
  2: { bodyColor: '#10b981', accentColor: '#065f46', badge: 'Lv2' },
  3: { bodyColor: '#8b5cf6', accentColor: '#4c1d95', badge: 'Lv3' },
  4: { bodyColor: '#f59e0b', accentColor: '#78350f', badge: 'Lv4' },
  5: { bodyColor: '#ef4444', accentColor: '#7f1d1d', badge: 'Lv5' },
}

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
}

function CarSprite({
  bodyColor,
  accentColor,
  label,
  isPlayer,
}: {
  bodyColor: string
  accentColor: string
  label: string
  isPlayer?: boolean
}) {
  return (
    <div className="relative flex flex-col items-center" style={{ fontSize: 0 }}>
      <span
        className={`mb-1 whitespace-nowrap rounded px-1.5 py-0.5 font-bold shadow ${
          isPlayer ? 'bg-blue-600 text-white' : 'bg-black/75 text-white'
        }`}
        style={{ fontSize: '10px', lineHeight: '12px' }}
      >
        {label}
      </span>
      <svg width="78" height="34" viewBox="0 0 78 34" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))' }}>
        <defs>
          <linearGradient id={`body-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
            <stop offset="55%" stopColor={bodyColor} stopOpacity="1" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`glass-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        <ellipse cx="39" cy="30" rx="34" ry="2" fill="#000" opacity="0.18" />

        <path
          d="M 6 22 L 12 14 Q 16 10 22 9 L 50 8 Q 58 8 64 12 L 72 18 L 72 24 Q 72 26 70 26 L 8 26 Q 6 26 6 24 Z"
          fill={`url(#body-${label})`}
          stroke={accentColor}
          strokeWidth="0.8"
        />

        <path d="M 17 14 Q 19 11 22 11 L 38 11 L 38 19 L 16 19 Z" fill={`url(#glass-${label})`} opacity="0.9" />
        <path d="M 40 11 L 52 11 Q 56 11 60 13 L 64 19 L 40 19 Z" fill={`url(#glass-${label})`} opacity="0.9" />
        <line x1="39" y1="11" x2="39" y2="19" stroke={accentColor} strokeWidth="0.8" />

        <rect x="6" y="17" width="3" height="2" rx="1" fill="#fde047" />
        <rect x="69" y="17" width="3" height="2" rx="1" fill="#fca5a5" />

        <path d="M 6 22 L 72 22 L 72 24 L 6 24 Z" fill={accentColor} opacity="0.6" />

        <g>
          <circle cx="18" cy="27" r="5" fill="#1f2937" />
          <circle cx="18" cy="27" r="3.2" fill="#374151" />
          <circle cx="18" cy="27" r="1.6" fill="#9ca3af" />
        </g>
        <g>
          <circle cx="58" cy="27" r="5" fill="#1f2937" />
          <circle cx="58" cy="27" r="3.2" fill="#374151" />
          <circle cx="58" cy="27" r="1.6" fill="#9ca3af" />
        </g>

        <path d="M 14 13 L 22 13" stroke="#fff" strokeWidth="0.6" opacity="0.4" />
      </svg>
    </div>
  )
}

export default function RaceTrack() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  const totalWords = state.chapterData.words.length
  const letterProgress = useAtomValue(letterProgressAtom)
  const resetLetterProgress = useSetAtom(letterProgressAtom)
  const playerWpm = state.timerData.wpm
  const elapsedTime = state.timerData.time
  const skinLevel = useAtomValue(skinLevelAtom)
  const boostTrigger = useAtomValue(boostTriggerAtom)
  const setEnergyBars = useSetAtom(energyBarsAtom)

  // 加速包累积偏移量，会叠加到玩家目标进度上（累加最多不超过 1）
  const [boostOffset, setBoostOffset] = useState(0)
  const playerTargetProgress = Math.min(1, Math.max(0, letterProgress + boostOffset))

  const [playerDisplay, setPlayerDisplay] = useState(0)
  const [opponentProgress, setOpponentProgress] = useState<number[]>(() => OPPONENTS.map(() => 0))

  // 监听加速包触发：每次 boostTrigger + 1，玩家进度弹射 +30%
  const lastBoostRef = useRef(boostTrigger)
  useEffect(() => {
    if (boostTrigger !== lastBoostRef.current) {
      lastBoostRef.current = boostTrigger
      setBoostOffset((prev) => Math.min(1, prev + BOOST_DISTANCE))
    }
  }, [boostTrigger])

  // 比赛结束时判第一名，若第一则送 1 根能量棒
  const rewardedRef = useRef(false)
  useEffect(() => {
    if (state.isFinished && !rewardedRef.current) {
      rewardedRef.current = true
      const maxOpponent = Math.max(0, ...opponentProgress)
      // 玩家完成本章即为 1（进度 = 1）；若玩家进度 >= 对手进度即算第一名
      if (1 >= maxOpponent) {
        setEnergyBars((bars) => bars + 1)
      }
    }
    if (!state.isFinished) rewardedRef.current = false
  }, [state.isFinished, opponentProgress, setEnergyBars])

  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const playerTargetRef = useRef(0)
  playerTargetRef.current = playerTargetProgress

  useEffect(() => {
    if (!state.isTyping) {
      lastTickRef.current = null
      return
    }
    const tick = (now: number) => {
      if (lastTickRef.current == null) lastTickRef.current = now
      const dtSec = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      setPlayerDisplay((prev) => {
        const target = playerTargetRef.current
        const diff = target - prev
        if (Math.abs(diff) < 0.0001) return target
        const lerpRate = 1 - Math.exp(-3.5 * dtSec)
        return prev + diff * lerpRate
      })

      setOpponentProgress((prev) =>
        prev.map((p, i) => {
          if (totalWords === 0) return 0
          const wordsAdded = (OPPONENTS[i].wpm * dtSec) / 60
          return Math.min(1, p + wordsAdded / totalWords)
        }),
      )

      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      lastTickRef.current = null
    }
  }, [state.isTyping, totalWords])

  useEffect(() => {
    if (!state.isTyping) {
      setPlayerDisplay(0)
      resetLetterProgress(0)
      setOpponentProgress(OPPONENTS.map(() => 0))
      setBoostOffset(0)
    }
  }, [state.isTyping, resetLetterProgress])

  const lanes = useMemo(() => {
    const skin = SKIN_STYLES[skinLevel] ?? SKIN_STYLES[1]
    return [
      {
        label: `YOU ${skin.badge}`,
        bodyColor: skin.bodyColor,
        accentColor: skin.accentColor,
        progress: playerDisplay,
        isPlayer: true,
      },
      ...OPPONENTS.map((o, i) => ({
        label: o.name,
        bodyColor: o.bodyColor,
        accentColor: o.accentColor,
        progress: opponentProgress[i] ?? 0,
        isPlayer: false,
      })),
    ]
  }, [playerDisplay, opponentProgress, skinLevel])

  return (
    <div
      className="relative w-full overflow-hidden border-b-2 border-gray-700 bg-gradient-to-b from-sky-300 to-sky-100 dark:from-slate-800 dark:to-slate-700"
      style={{ fontSize: 0 }}
    >
      <div
        className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-1 text-gray-800 dark:text-gray-100"
        style={{ fontSize: '12px', lineHeight: '16px' }}
      >
        <div className="rounded bg-white/80 px-2 py-0.5 font-mono font-bold shadow dark:bg-black/40">{playerWpm} WPM</div>
        <div className="rounded bg-white/80 px-2 py-0.5 font-mono font-bold shadow dark:bg-black/40">{formatTime(elapsedTime)}</div>
      </div>

      <div className="relative bg-gray-800" style={{ marginTop: '24px' }}>
        <div className="absolute bottom-0 left-12 top-0 w-1 bg-white" aria-hidden />
        <div
          className="absolute bottom-0 right-3 top-0 w-3"
          style={{
            backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, #000 0% 50%)',
            backgroundSize: '12px 12px',
          }}
          aria-hidden
        />
        {lanes.map((lane, i) => {
          const isLast = i === lanes.length - 1
          const trackUsable = `calc(100% - 110px)`
          return (
            <div
              key={lane.label}
              className={`relative ${!isLast ? 'border-b border-dashed border-yellow-200/70' : ''}`}
              style={{ height: '56px' }}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{
                  left: `calc(48px + (${trackUsable}) * ${lane.progress} - 39px)`,
                  willChange: 'left',
                }}
              >
                <CarSprite bodyColor={lane.bodyColor} accentColor={lane.accentColor} label={lane.label} isPlayer={lane.isPlayer} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
