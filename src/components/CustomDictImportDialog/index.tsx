import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { authUserAtom } from '@/store/authAtom'
import { reloadCustomDictionariesAtom } from '@/store/customDictAtom'
import { db } from '@/utils/db'
import { CustomDictRecord } from '@/utils/db/record'
import { parseDictFile } from '@/utils/parseDictFile'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useRef, useState } from 'react'
import * as XLSX from 'xlsx'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'idle' | 'parsing' | 'form' | 'saving'

export default function CustomDictImportDialog({ open, onOpenChange }: Props) {
  const user = useAtomValue(authUserAtom)
  const reload = useSetAtom(reloadCustomDictionariesAtom)
  const [step, setStep] = useState<Step>('idle')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [wordsPreview, setWordsPreview] = useState<{ count: number; skipped: number } | null>(null)
  const [parsedWords, setParsedWords] = useState<Awaited<ReturnType<typeof parseDictFile>>['words']>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStep('idle')
    setName('')
    setDescription('')
    setWordsPreview(null)
    setParsedWords([])
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) reset()
      onOpenChange(nextOpen)
    },
    [onOpenChange, reset],
  )

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setStep('parsing')
    try {
      const { words, skipped } = await parseDictFile(file)
      setParsedWords(words)
      setWordsPreview({ count: words.length, skipped })
      const defaultName = file.name.replace(/\.[^.]+$/, '')
      setName((prev) => prev || defaultName)
      setStep('form')
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败')
      setStep('idle')
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!user) {
      setError('请先登录后再导入词典')
      return
    }
    if (!name.trim()) {
      setError('请填写词典名称')
      return
    }
    setStep('saving')
    try {
      const dictId = `custom-${user.phone}-${Date.now()}`
      await db.customDicts.add(new CustomDictRecord(dictId, user.phone, name.trim(), description.trim(), parsedWords))
      await reload()
      handleClose(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
      setStep('form')
    }
  }, [user, name, description, parsedWords, reload, handleClose])

  const downloadTemplate = useCallback(() => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['单词', '中文释义（多个用 / 分隔）', '美式音标（可选）', '英式音标（可选）'],
      ['apple', '苹果', '/ˈæpəl/', '/ˈæp(ə)l/'],
      ['book', '书籍/预订', '/bʊk/', '/bʊk/'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, '词典')
    XLSX.writeFile(wb, '思研阁词典模板.xlsx')
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>导入我的词典</DialogTitle>
          <DialogDescription>
            支持 Excel (.xlsx) 和 CSV 文件。第 1 列填单词，第 2 列填中文释义，多个释义用「/」分隔。音标可选。
          </DialogDescription>
        </DialogHeader>

        {step === 'idle' && (
          <div className="flex flex-col gap-4">
            <label
              htmlFor="dict-file-input"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500"
            >
              <span className="text-base font-medium text-slate-700 dark:text-slate-200">点击选择文件</span>
              <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">支持 .xlsx / .xls / .csv</span>
              <input
                id="dict-file-input"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </label>
            <button
              type="button"
              onClick={downloadTemplate}
              className="self-start text-sm text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
            >
              下载模板文件
            </button>
            {error && <p className="text-sm text-rose-500">{error}</p>}
          </div>
        )}

        {step === 'parsing' && <p className="py-8 text-center text-sm text-slate-500">解析中……</p>}

        {(step === 'form' || step === 'saving') && wordsPreview && (
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              成功解析 {wordsPreview.count} 个单词
              {wordsPreview.skipped > 0 && `，跳过 ${wordsPreview.skipped} 行（缺少单词或释义）`}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">词典名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：我的六级核心词"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">词典描述（可选）</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例：期末复习专用"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                disabled={step === 'saving'}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                重新选择
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={step === 'saving'}
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
              >
                {step === 'saving' ? '保存中……' : '保存词典'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
