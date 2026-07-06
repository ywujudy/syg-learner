export type PhonicsType = 'consonant-digraph' | 'vowel-digraph' | 'r-controlled' | 'vowel' | 'consonant' | 'other'

const CONSONANT_DIGRAPHS = ['ch', 'sh', 'th', 'wh', 'ph', 'ng', 'ck', 'qu']
const VOWEL_DIGRAPHS = ['ai', 'ee', 'ea', 'oa', 'oi', 'oo', 'ou', 'ow', 'ay', 'oy', 'ie', 'ue', 'ui']
const R_CONTROLLED = ['ar', 'er', 'ir', 'or', 'ur']
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

export type PhonicsSegment = {
  type: PhonicsType
  start: number
  length: number
}

export function segmentPhonics(word: string): PhonicsSegment[] {
  const segments: PhonicsSegment[] = []
  const lower = word.toLowerCase()
  let i = 0
  while (i < lower.length) {
    const ch = lower[i]
    const pair = lower.slice(i, i + 2)

    if (i + 2 <= lower.length && CONSONANT_DIGRAPHS.includes(pair)) {
      segments.push({ type: 'consonant-digraph', start: i, length: 2 })
      i += 2
    } else if (i + 2 <= lower.length && R_CONTROLLED.includes(pair)) {
      segments.push({ type: 'r-controlled', start: i, length: 2 })
      i += 2
    } else if (i + 2 <= lower.length && VOWEL_DIGRAPHS.includes(pair)) {
      segments.push({ type: 'vowel-digraph', start: i, length: 2 })
      i += 2
    } else if (/[a-z]/.test(ch)) {
      segments.push({ type: VOWELS.has(ch) ? 'vowel' : 'consonant', start: i, length: 1 })
      i += 1
    } else {
      segments.push({ type: 'other', start: i, length: 1 })
      i += 1
    }
  }
  return segments
}

export function buildPhonicsTypeMap(word: string): PhonicsType[] {
  const segs = segmentPhonics(word)
  const out: PhonicsType[] = new Array(word.length).fill('other')
  for (const seg of segs) {
    for (let k = 0; k < seg.length; k++) {
      out[seg.start + k] = seg.type
    }
  }
  return out
}

function isVowelLike(type: PhonicsType): boolean {
  return type === 'vowel' || type === 'vowel-digraph' || type === 'r-controlled'
}

function isConsonantLike(type: PhonicsType): boolean {
  return type === 'consonant' || type === 'consonant-digraph'
}

export function buildSyllableIndexMap(word: string): number[] {
  const segs = segmentPhonics(word)
  if (segs.length === 0) return []

  const syllableOfSeg: number[] = new Array(segs.length).fill(-1)
  let syllable = -1
  let seenVowelInSyllable = false

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i]

    if (isVowelLike(seg.type)) {
      if (seenVowelInSyllable) {
        syllable++
        seenVowelInSyllable = true
      } else {
        if (syllable === -1) syllable = 0
        seenVowelInSyllable = true
      }
      syllableOfSeg[i] = syllable
    } else if (isConsonantLike(seg.type)) {
      if (!seenVowelInSyllable) {
        if (syllable === -1) syllable = 0
        syllableOfSeg[i] = syllable
        continue
      }
      let nextVowelIdx = -1
      let nextConsonantCount = 0
      for (let j = i; j < segs.length; j++) {
        if (isVowelLike(segs[j].type)) {
          nextVowelIdx = j
          break
        }
        if (isConsonantLike(segs[j].type)) nextConsonantCount++
      }
      if (nextVowelIdx === -1) {
        syllableOfSeg[i] = syllable
      } else if (nextConsonantCount === 1) {
        syllable++
        syllableOfSeg[i] = syllable
        seenVowelInSyllable = false
      } else {
        const consonantsBefore = nextConsonantCount
        const splitAfter = Math.ceil(consonantsBefore / 2)
        let consonantSeen = 0
        for (let j = i; j < nextVowelIdx; j++) {
          if (isConsonantLike(segs[j].type)) {
            consonantSeen++
            if (consonantSeen <= splitAfter) {
              syllableOfSeg[j] = syllable
            } else {
              if (syllableOfSeg[j] === -1) {
                syllableOfSeg[j] = syllable + 1
              }
            }
          } else {
            syllableOfSeg[j] = syllable
          }
        }
        syllable++
        seenVowelInSyllable = false
        i = nextVowelIdx - 1
      }
    } else {
      syllableOfSeg[i] = Math.max(syllable, 0)
    }
  }

  const out: number[] = new Array(word.length).fill(0)
  for (let i = 0; i < segs.length; i++) {
    const s = syllableOfSeg[i]
    for (let k = 0; k < segs[i].length; k++) {
      out[segs[i].start + k] = Math.max(0, s)
    }
  }
  return out
}
