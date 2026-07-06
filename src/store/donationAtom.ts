import { atomWithStorage } from 'jotai/utils'

export type DonationRecord = {
  id: string
  name: string
  amount: number
  message?: string
  createdAt: number
}

const seedDonations: DonationRecord[] = [
  { id: 'seed-1', name: '匿名', amount: 200, createdAt: Date.now() - 86400000 * 2 },
  { id: 'seed-2', name: '小明', amount: 100, message: '加油！', createdAt: Date.now() - 86400000 * 3 },
  { id: 'seed-3', name: 'Frank', amount: 88, createdAt: Date.now() - 86400000 * 5 },
]

export const donationsAtom = atomWithStorage<DonationRecord[]>('syg-donations', seedDonations)
