import { authUserAtom } from '@/store/authAtom'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { atomFamily } from 'jotai/utils'

export const SKIN_MAX_LEVEL = 5
export const SKIN_COST = 10
export const BOOST_COST = 1
export const ENERGY_PER_BAR = 100
export const BOOST_DISTANCE = 0.3

const GUEST_KEY = 'guest'

const pointsStore = atomFamily((accountKey: string) => atomWithStorage<number>(`syg-energy-points-${accountKey}`, 0))
const barsStore = atomFamily((accountKey: string) => atomWithStorage<number>(`syg-energy-bars-${accountKey}`, 0))
const skinStore = atomFamily((accountKey: string) => atomWithStorage<number>(`syg-skin-level-${accountKey}`, 1))

const migrateLegacyGuest = () => {
  if (typeof window === 'undefined') return
  const legacyMap: Array<[string, string]> = [
    ['syg-energy-points', `syg-energy-points-${GUEST_KEY}`],
    ['syg-energy-bars', `syg-energy-bars-${GUEST_KEY}`],
    ['syg-skin-level', `syg-skin-level-${GUEST_KEY}`],
  ]
  for (const [oldKey, newKey] of legacyMap) {
    const oldVal = window.localStorage.getItem(oldKey)
    if (oldVal !== null && window.localStorage.getItem(newKey) === null) {
      window.localStorage.setItem(newKey, oldVal)
    }
  }
}
migrateLegacyGuest()

const accountKeyAtom = atom((get) => {
  const user = get(authUserAtom)
  return user?.phone ? user.phone : GUEST_KEY
})

export const energyPointsAtom = atom(
  (get) => get(pointsStore(get(accountKeyAtom))),
  (get, set, update: number | ((prev: number) => number)) => {
    const target = pointsStore(get(accountKeyAtom))
    set(target, typeof update === 'function' ? update(get(target)) : update)
  },
)

export const energyBarsAtom = atom(
  (get) => get(barsStore(get(accountKeyAtom))),
  (get, set, update: number | ((prev: number) => number)) => {
    const target = barsStore(get(accountKeyAtom))
    set(target, typeof update === 'function' ? update(get(target)) : update)
  },
)

export const skinLevelAtom = atom(
  (get) => get(skinStore(get(accountKeyAtom))),
  (get, set, update: number | ((prev: number) => number)) => {
    const target = skinStore(get(accountKeyAtom))
    set(target, typeof update === 'function' ? update(get(target)) : update)
  },
)

// 本局持有的加速包数量（每局清零，属于本局临时状态）
export const boostChargesAtom = atom<number>(0)

// 触发一次加速弹射的事件计数器（每 +1 表示要弹射一次）
export const boostTriggerAtom = atom<number>(0)
