// 扫描 public/历年真题已更新至25年1月/，将 PDF 差量上传到 Vercel Blob，
// 并生成 src/pages/Exam/edx-math-papers.json（url 指向 Blob 公网地址）。
//
// 使用：
//   1) 在项目根 .env 或 .env.local 里配置：BLOB_READ_WRITE_TOKEN=xxxxx
//      （从 Vercel 项目 → Storage → Blob → .env.local Snippet 复制）
//   2) node scripts/build-edx-index.mjs
//
// 说明：
//   - 已在远端存在（pathname + size 相同）的 PDF 会跳过，只上传新增/变更文件。
//   - Vercel Blob 单文件公网 URL 永久有效；本脚本使用 addRandomSuffix:false，
//     使同名文件覆盖后 URL 保持稳定。
import { list, put } from '@vercel/blob'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// 优先读 .env.local，兜底 .env
dotenv.config({ path: path.join(ROOT, '.env.local') })
dotenv.config({ path: path.join(ROOT, '.env') })
const SRC = path.join(ROOT, 'public', '历年真题已更新至25年1月')
const OUT = path.join(ROOT, 'src', 'pages', 'Exam', 'edx-math-papers.json')
const BLOB_PREFIX = 'edx-math/'

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('缺少 BLOB_READ_WRITE_TOKEN 环境变量。')
  console.error('请在 Vercel 项目 → Storage → Blob 页面复制 .env.local 到项目根目录。')
  process.exit(1)
}

const nameRegex = /^(\d{2})_(\d{2})_(MS|QP)_([A-Z0-9]+?)(R)?\.pdf$/i

function collectLocalFiles(dir) {
  const files = []
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const abs = path.join(d, entry.name)
      if (entry.isDirectory()) walk(abs)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) files.push(abs)
    }
  }
  walk(dir)
  return files
}

async function fetchRemoteIndex() {
  const remote = new Map() // pathname -> { url, size }
  let cursor
  do {
    const res = await list({ prefix: BLOB_PREFIX, cursor, token })
    for (const blob of res.blobs) {
      remote.set(blob.pathname, { url: blob.url, size: blob.size })
    }
    cursor = res.cursor
  } while (cursor)
  return remote
}

async function main() {
  console.log('扫描本地 PDF...')
  const localAbs = collectLocalFiles(SRC)
  console.log(`本地共 ${localAbs.length} 份 PDF`)

  console.log('拉取远端 Blob 列表...')
  const remote = await fetchRemoteIndex()
  console.log(`远端已有 ${remote.size} 份`)

  const papers = []
  let uploaded = 0
  let skipped = 0

  for (const abs of localAbs) {
    const fileName = path.basename(abs)
    const m = fileName.match(nameRegex)
    if (!m) {
      console.warn('skip (unmatched name):', fileName)
      continue
    }
    const [, yy, mm, type, unit, r] = m
    const stat = fs.statSync(abs)
    const pathname = BLOB_PREFIX + fileName

    let publicUrl
    const remoteEntry = remote.get(pathname)
    if (remoteEntry && remoteEntry.size === stat.size) {
      publicUrl = remoteEntry.url
      skipped++
    } else {
      const data = fs.readFileSync(abs)
      const res = await put(pathname, data, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      })
      publicUrl = res.url
      uploaded++
      console.log(`upload (${uploaded}): ${fileName}`)
    }

    papers.push({
      id: fileName.replace(/\.pdf$/i, ''),
      unit: unit.toUpperCase(),
      year: 2000 + parseInt(yy, 10),
      month: parseInt(mm, 10),
      type: type.toUpperCase(),
      variant: r ? 'R' : null,
      fileName,
      url: publicUrl,
    })
  }

  papers.sort((a, b) => {
    if (a.unit !== b.unit) return a.unit.localeCompare(b.unit)
    if (a.year !== b.year) return b.year - a.year
    if (a.month !== b.month) return b.month - a.month
    if (a.type !== b.type) return a.type === 'QP' ? -1 : 1
    return (a.variant ?? '').localeCompare(b.variant ?? '')
  })

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(papers, null, 2), 'utf8')
  console.log(`上传 ${uploaded} 份，跳过 ${skipped} 份，索引 ${papers.length} 条 → ${path.relative(ROOT, OUT)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
