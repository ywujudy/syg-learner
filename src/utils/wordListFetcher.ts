import type { Word } from '@/typings'
import { db } from '@/utils/db'

const CUSTOM_PREFIX = 'custom:'

export async function wordListFetcher(url: string): Promise<Word[]> {
  if (url.startsWith(CUSTOM_PREFIX)) {
    const dictId = url.slice(CUSTOM_PREFIX.length)
    const record = await db.customDicts.where('dictId').equals(dictId).first()
    if (!record) {
      throw new Error(`未找到自定义词典 ${dictId}`)
    }
    return record.words
  }

  const URL_PREFIX: string = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''

  const response = await fetch(URL_PREFIX + url)
  const words: Word[] = await response.json()
  return words
}
