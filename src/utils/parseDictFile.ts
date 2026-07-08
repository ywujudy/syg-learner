import type { Word } from '@/typings'
import * as XLSX from 'xlsx'

export type ParsedDict = {
  words: Word[]
  skipped: number
}

const HEADER_KEYWORDS = ['单词', 'word', 'name', 'english', '英文']
const TRANS_SPLIT_RE = /[;/、\n]+/

function normalizeTrans(raw: unknown): string[] {
  if (raw == null) return []
  return String(raw)
    .split(TRANS_SPLIT_RE)
    .map((s) => s.trim())
    .filter(Boolean)
}

function isHeaderRow(row: unknown[]): boolean {
  const first = String(row[0] ?? '')
    .trim()
    .toLowerCase()
  if (!first) return false
  return HEADER_KEYWORDS.some((kw) => first === kw.toLowerCase())
}

export async function parseDictFile(file: File): Promise<ParsedDict> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error('文件里没有可用的工作表')
  }
  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false })

  const words: Word[] = []
  let skipped = 0

  rows.forEach((row, idx) => {
    if (!Array.isArray(row) || row.length === 0) return
    if (idx === 0 && isHeaderRow(row)) return

    const name = String(row[0] ?? '').trim()
    const trans = normalizeTrans(row[1])

    if (!name || trans.length === 0) {
      skipped++
      return
    }

    const usphone = String(row[2] ?? '').trim()
    const ukphone = String(row[3] ?? '').trim()

    words.push({
      name,
      trans,
      usphone,
      ukphone,
    })
  })

  if (words.length === 0) {
    throw new Error('没有解析到有效单词，请检查文件格式（第 1 列填单词，第 2 列填中文释义）')
  }

  return { words, skipped }
}
