import { authUserAtom } from './authAtom'
import type { Dictionary } from '@/typings'
import { calcChapterCount } from '@/utils'
import { db } from '@/utils/db'
import type { ICustomDictRecord } from '@/utils/db/record'
import { atom } from 'jotai'

export const CUSTOM_DICT_URL_PREFIX = 'custom:'
export const CUSTOM_DICT_CATEGORY = '我的词典'

export function toDictionary(record: ICustomDictRecord): Dictionary {
  return {
    id: record.dictId,
    name: record.name,
    description: record.description,
    category: CUSTOM_DICT_CATEGORY,
    tags: ['我的词典'],
    url: `${CUSTOM_DICT_URL_PREFIX}${record.dictId}`,
    length: record.words.length,
    language: 'en',
    languageCategory: 'en',
    chapterCount: calcChapterCount(record.words.length),
  }
}

// 当前用户的自定义词典列表（同步）；由 useLoadCustomDicts 从 IndexedDB 刷新
export const customDictionariesAtom = atom<Dictionary[]>([])

export const customDictMapAtom = atom<Record<string, Dictionary>>((get) => {
  return Object.fromEntries(get(customDictionariesAtom).map((d) => [d.id, d]))
})

// 由 refresh 触发 load 的写入 atom
export const reloadCustomDictionariesAtom = atom(null, async (get, set) => {
  const user = get(authUserAtom)
  if (!user) {
    set(customDictionariesAtom, [])
    return
  }
  const records = await db.customDicts.where('userId').equals(user.phone).toArray()
  set(customDictionariesAtom, records.map(toDictionary))
})
