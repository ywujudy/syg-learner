import { EXPLICIT_SPACE } from '@/constants'
import { fontSizeConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

const stateClassNameMap: Record<string, Record<LetterState, string>> = {
  true: {
    normal: 'text-gray-400',
    correct: 'text-green-400 dark:text-green-700',
    wrong: 'text-black dark:text-white',
  },
  false: {
    normal: 'text-gray-600 dark:text-gray-50',
    correct: 'text-green-600 dark:text-green-400',
    wrong: 'text-black dark:text-white',
  },
}

const syllableColors = [
  'text-blue-600 dark:text-blue-400',
  'text-pink-600 dark:text-pink-400',
  'text-amber-600 dark:text-amber-400',
  'text-purple-600 dark:text-purple-400',
  'text-cyan-600 dark:text-cyan-400',
  'text-rose-600 dark:text-rose-400',
]

export type LetterProps = {
  letter: string
  state?: LetterState
  visible?: boolean
  syllableIndex?: number
}

const Letter: React.FC<LetterProps> = ({ letter, state = 'normal', visible = true, syllableIndex }) => {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const isExplicitSpace = letter === EXPLICIT_SPACE
  const colorClass =
    state === 'normal' && !isExplicitSpace && typeof syllableIndex === 'number'
      ? syllableColors[syllableIndex % syllableColors.length]
      : stateClassNameMap[isExplicitSpace as unknown as string][state]
  return (
    <span
      className={`m-0 p-0 font-mono font-normal ${colorClass} pr-0.8 duration-0 dark:text-opacity-80`}
      style={{ fontSize: fontSizeConfig.foreignFont.toString() + 'px' }}
    >
      {visible ? letter : '_'}
    </span>
  )
}

export default React.memo(Letter)
