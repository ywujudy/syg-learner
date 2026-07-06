import { authUserAtom } from './authAtom'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'

const GUEST_KEY = 'guest'

const redeemedStore = atomFamily((accountKey: string) => atomWithStorage<string[]>(`syg-redeemed-codes-${accountKey}`, []))

const migrateLegacyGuest = () => {
  if (typeof window === 'undefined') return
  const oldKey = 'syg-redeemed-codes'
  const newKey = `syg-redeemed-codes-${GUEST_KEY}`
  const oldVal = window.localStorage.getItem(oldKey)
  if (oldVal !== null && window.localStorage.getItem(newKey) === null) {
    window.localStorage.setItem(newKey, oldVal)
  }
}
migrateLegacyGuest()

const accountKeyAtom = atom((get) => {
  const user = get(authUserAtom)
  return user?.phone ? user.phone : GUEST_KEY
})

export const redeemedCodesAtom = atom(
  (get) => get(redeemedStore(get(accountKeyAtom))),
  (get, set, update: string[] | ((prev: string[]) => string[])) => {
    const target = redeemedStore(get(accountKeyAtom))
    set(target, typeof update === 'function' ? update(get(target)) : update)
  },
)

// 兑换码定义。key 为大写码，value 为奖励能量棒数量。
export const REDEEM_CODES: Record<string, number> = {
  SIYANGE2026: 10000,
}
