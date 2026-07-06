// 扫描 public/历年真题已更新至25年1月/ 生成 src/pages/Exam/edx-math-papers.json
// 使用：node scripts/build-edx-index.mjs
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'public', '历年真题已更新至25年1月')
const OUT = path.join(ROOT, 'src', 'pages', 'Exam', 'edx-math-papers.json')

// 文件名格式常见：24_01_MS_P1.pdf / 25_01_QP_P1R.pdf / 24_06_MS_P1R.pdf
// 组：2位年 _ 2位月 _ 类型(MS/QP) _ 单元(可能带 R 后缀)
const nameRegex = /^(\d{2})_(\d{2})_(MS|QP)_([A-Z0-9]+?)(R)?\.pdf$/i

const papers = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(abs)
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      const m = entry.name.match(nameRegex)
      if (!m) {
        console.warn('skip (unmatched name):', entry.name)
        continue
      }
      const [, yy, mm, type, unit, r] = m
      const year = 2000 + parseInt(yy, 10)
      const month = parseInt(mm, 10)
      const relative = path.relative(path.join(ROOT, 'public'), abs).split(path.sep).join('/')
      papers.push({
        id: entry.name.replace(/\.pdf$/i, ''),
        unit: unit.toUpperCase(),
        year,
        month,
        type: type.toUpperCase(),
        variant: r ? 'R' : null,
        fileName: entry.name,
        url: '/' + relative,
      })
    }
  }
}

walk(SRC)

// 排序：单元名 > 年 > 月 > 类型（QP 在 MS 前）
papers.sort((a, b) => {
  if (a.unit !== b.unit) return a.unit.localeCompare(b.unit)
  if (a.year !== b.year) return b.year - a.year
  if (a.month !== b.month) return b.month - a.month
  if (a.type !== b.type) return a.type === 'QP' ? -1 : 1
  return (a.variant ?? '').localeCompare(b.variant ?? '')
})

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(papers, null, 2), 'utf8')
console.log(`Wrote ${papers.length} papers to`, path.relative(ROOT, OUT))
