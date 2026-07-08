import DictionaryGroup from './CategoryDicts'
import { LanguageTabSwitcher } from './LanguageTabSwitcher'
import CustomDictImportDialog from '@/components/CustomDictImportDialog'
import Layout from '@/components/Layout'
import { dictionaries } from '@/resources/dictionary'
import { currentDictInfoAtom } from '@/store'
import { authUserAtom } from '@/store/authAtom'
import { customDictionariesAtom, reloadCustomDictionariesAtom } from '@/store/customDictAtom'
import type { Dictionary, LanguageCategoryType } from '@/typings'
import groupBy, { groupByDictTags } from '@/utils/groupBy'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtomValue, useSetAtom } from 'jotai'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import type { Updater } from 'use-immer'
import { useImmer } from 'use-immer'
import IconX from '~icons/tabler/x'

export type GalleryState = {
  currentLanguageTab: LanguageCategoryType
}

const initialGalleryState: GalleryState = {
  currentLanguageTab: 'en',
}

export const GalleryContext = createContext<{
  state: GalleryState
  setState: Updater<GalleryState>
} | null>(null)

export default function GalleryPage() {
  const [galleryState, setGalleryState] = useImmer<GalleryState>(initialGalleryState)
  const navigate = useNavigate()
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const user = useAtomValue(authUserAtom)
  const customDicts = useAtomValue(customDictionariesAtom)
  const reloadCustomDicts = useSetAtom(reloadCustomDictionariesAtom)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    reloadCustomDicts()
  }, [user, reloadCustomDicts])

  const { groupedByCategoryAndTag } = useMemo(() => {
    const allDicts = [...dictionaries, ...customDicts]
    const currentLanguageCategoryDicts = allDicts.filter((dict) => dict.languageCategory === galleryState.currentLanguageTab)
    const groupedByCategory = Object.entries(groupBy(currentLanguageCategoryDicts, (dict) => dict.category))
    const groupedByCategoryAndTag = groupedByCategory.map(
      ([category, dicts]) => [category, groupByDictTags(dicts)] as [string, Record<string, Dictionary[]>],
    )

    return {
      groupedByCategoryAndTag,
    }
  }, [galleryState.currentLanguageTab, customDicts])

  const onBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  useEffect(() => {
    if (currentDictInfo) {
      setGalleryState((state) => {
        state.currentLanguageTab = currentDictInfo.languageCategory
      })
    }
  }, [currentDictInfo, setGalleryState])

  return (
    <Layout>
      <GalleryContext.Provider value={{ state: galleryState, setState: setGalleryState }}>
        <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
          <div className="absolute right-20 top-10 flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600"
              >
                导入并新建我的词典
              </button>
            )}
            <IconX className="h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
          </div>
          <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="flex h-20 w-full items-center pb-6 pr-20">
                <LanguageTabSwitcher />
              </div>
              <ScrollArea.Root className="flex-1 overflow-y-auto">
                <ScrollArea.Viewport className="h-full w-full ">
                  <div className="mr-4 flex flex-1 flex-col items-start justify-start gap-14 overflow-y-auto">
                    {groupedByCategoryAndTag.map(([category, groupeByTag]) => (
                      <DictionaryGroup key={category} groupedDictsByTag={groupeByTag} />
                    ))}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
              </ScrollArea.Root>
              {/* todo: 增加导航 */}
              {/* <div className="mt-20 h-40 w-40 text-center ">
                <CategoryNavigation />
              </div> */}
            </div>
          </div>
        </div>
        <CustomDictImportDialog open={importOpen} onOpenChange={setImportOpen} />
      </GalleryContext.Provider>
    </Layout>
  )
}
