import { type PostListResp, type PostSummary, createPost, fetchPosts } from './api'
import logo from '@/assets/syg-logo.jpg'
import AuthDialog from '@/components/AuthDialog'
import Footer from '@/components/Footer'
import { authUserAtom } from '@/store/authAtom'
import { useAtomValue } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const TITLE_MAX = 80
const CONTENT_MAX = 2000

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const TreeHole: React.FC = () => {
  const user = useAtomValue(authUserAtom)
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PostListResp | null>(null)
  const [loading, setLoading] = useState(false)
  const [listErr, setListErr] = useState<string | null>(null)

  const [composeOpen, setComposeOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postErr, setPostErr] = useState<string | null>(null)

  const loadPage = useCallback(async (p: number) => {
    setLoading(true)
    setListErr(null)
    try {
      const resp = await fetchPosts(p)
      setData(resp)
    } catch (err) {
      setListErr(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPage(page)
  }, [page, loadPage])

  const openCompose = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setComposeOpen(true)
  }

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setAuthOpen(true)
      return
    }
    setPostErr(null)
    const t = title.trim()
    const c = content.trim()
    if (!t) {
      setPostErr('请输入标题')
      return
    }
    if (t.length > TITLE_MAX) {
      setPostErr(`标题不能超过 ${TITLE_MAX} 字`)
      return
    }
    if (!c) {
      setPostErr('请输入正文')
      return
    }
    if (c.length > CONTENT_MAX) {
      setPostErr(`正文不能超过 ${CONTENT_MAX} 字`)
      return
    }
    setPosting(true)
    try {
      await createPost(user, { title: t, content: c })
      setTitle('')
      setContent('')
      setComposeOpen(false)
      if (page !== 1) setPage(1)
      else loadPage(1)
    } catch (err) {
      setPostErr(err instanceof Error ? err.message : '发布失败')
    } finally {
      setPosting(false)
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-indigo-200/40 via-transparent to-transparent dark:from-indigo-500/10" />

      <header className="container relative z-10 mx-auto flex w-full items-center justify-between px-6 py-6 lg:px-10">
        <NavLink to="/" className="flex items-center">
          <img src={logo} className="mr-3 h-10 w-10 rounded-lg shadow-sm lg:h-12 lg:w-12" alt="思研阁 Logo" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 lg:text-xl">思研阁</span>
            <span className="flex w-full justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              <span>SI</span>
              <span>YAN</span>
              <span>GE</span>
            </span>
          </div>
        </NavLink>
        <NavLink
          to="/"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          返回首页
        </NavLink>
      </header>

      <main className="container relative z-10 mx-auto px-6 pb-16 lg:px-10">
        <section className="mx-auto max-w-3xl pb-8 pt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lg:text-5xl">🌳 树洞</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 lg:text-base">
            有不懂的学科问题可以提出，也可以解答别人的疑惑。留下你的思考，让讨论继续。
          </p>
        </section>

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">{data ? `共 ${data.total} 条留言` : '加载中...'}</div>
            <button
              type="button"
              onClick={openCompose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              {user ? '发布新帖' : '登录后发帖'}
            </button>
          </div>

          {composeOpen && user && (
            <form
              onSubmit={submitPost}
              className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">发布新帖</h2>
                <span className="text-xs text-slate-400">以 {user.name} 的身份发布</span>
              </div>
              <label className="mb-3 flex flex-col gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  标题（{title.length}/{TITLE_MAX}）
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={TITLE_MAX}
                  placeholder="一句话描述你的问题或想法"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
              <label className="mb-3 flex flex-col gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  正文（{content.length}/{CONTENT_MAX}）
                </span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={CONTENT_MAX}
                  rows={5}
                  placeholder="展开说说..."
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
              {postErr && <p className="mb-3 text-sm text-red-500">{postErr}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setComposeOpen(false)
                    setPostErr(null)
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {posting ? '发布中...' : '发布'}
                </button>
              </div>
            </form>
          )}

          {listErr && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {listErr}
              <button type="button" onClick={() => loadPage(page)} className="ml-3 underline hover:text-red-700 dark:hover:text-red-200">
                重试
              </button>
            </div>
          )}

          {loading && !data && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400 dark:border-slate-700">
              加载中...
            </div>
          )}

          {data && data.posts.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400 dark:border-slate-700">
              还没有帖子，来做第一个发布者吧
            </div>
          )}

          {data && data.posts.length > 0 && (
            <ul className="flex flex-col gap-3">
              {data.posts.map((post) => (
                <PostCard key={post.id} post={post} onClick={() => navigate(`/tree-hole/${post.id}`)} />
              ))}
            </ul>
          )}

          {data && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                上一页
              </button>
              <span className="text-slate-500 dark:text-slate-400">
                第 {page} / {totalPages} 页
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}

type PostCardProps = {
  post: PostSummary
  onClick: () => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <li
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="line-clamp-1 flex-1 text-base font-semibold text-slate-900 dark:text-white">{post.title}</h3>
        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{formatRelative(post.lastActiveAt)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{post.content}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span>👤 {post.authorName}</span>
        <span>💬 {post.replyCount}</span>
      </div>
    </li>
  )
}

export default TreeHole
