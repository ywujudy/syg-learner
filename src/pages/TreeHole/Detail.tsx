import { type PostDetailResp, createReply, deletePost as deletePostApi, deleteReply as deleteReplyApi, fetchPost } from './api'
import logo from '@/assets/syg-logo.jpg'
import AuthDialog from '@/components/AuthDialog'
import Footer from '@/components/Footer'
import { authUserAtom } from '@/store/authAtom'
import { useAtomValue } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'

const REPLY_MAX = 1000

const formatFull = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const TreeHoleDetail: React.FC = () => {
  const params = useParams<{ id: string }>()
  const postId = Number(params.id)
  const navigate = useNavigate()
  const user = useAtomValue(authUserAtom)
  const [authOpen, setAuthOpen] = useState(false)

  const [data, setData] = useState<PostDetailResp | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyErr, setReplyErr] = useState<string | null>(null)

  const [deletingPost, setDeletingPost] = useState(false)
  const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!Number.isInteger(postId) || postId <= 0) {
      setErr('无效的帖子 id')
      return
    }
    setLoading(true)
    setErr(null)
    try {
      const resp = await fetchPost(postId)
      setData(resp)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setAuthOpen(true)
      return
    }
    setReplyErr(null)
    const text = replyText.trim()
    if (!text) {
      setReplyErr('请输入回复内容')
      return
    }
    if (text.length > REPLY_MAX) {
      setReplyErr(`回复不能超过 ${REPLY_MAX} 字`)
      return
    }
    setReplying(true)
    try {
      await createReply(user, postId, text)
      setReplyText('')
      await load()
    } catch (e) {
      setReplyErr(e instanceof Error ? e.message : '回复失败')
    } finally {
      setReplying(false)
    }
  }

  const handleDeletePost = async () => {
    if (!user || !data) return
    if (!window.confirm('确定删除这个帖子吗？删除后所有回复也会一并消失。')) return
    setDeletingPost(true)
    try {
      await deletePostApi(user, data.post.id)
      navigate('/tree-hole')
    } catch (e) {
      setErr(e instanceof Error ? e.message : '删除失败')
      setDeletingPost(false)
    }
  }

  const handleDeleteReply = async (replyId: number) => {
    if (!user) return
    if (!window.confirm('确定删除这条回复吗？')) return
    setDeletingReplyId(replyId)
    try {
      await deleteReplyApi(user, replyId)
      await load()
    } catch (e) {
      setReplyErr(e instanceof Error ? e.message : '删除失败')
    } finally {
      setDeletingReplyId(null)
    }
  }

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
          to="/tree-hole"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          返回树洞
        </NavLink>
      </header>

      <main className="container relative z-10 mx-auto max-w-3xl px-6 pb-16 lg:px-10">
        {loading && !data && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400 dark:border-slate-700">
            加载中...
          </div>
        )}

        {err && !data && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {err}
            <button type="button" onClick={load} className="ml-3 underline">
              重试
            </button>
          </div>
        )}

        {data && (
          <>
            <article className="mt-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h1 className="flex-1 text-xl font-semibold text-slate-900 dark:text-white lg:text-2xl">{data.post.title}</h1>
                {user && user.phone === data.post.authorPhone && (
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    disabled={deletingPost}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-500 disabled:opacity-50 dark:text-slate-500"
                  >
                    {deletingPost ? '删除中...' : '删除'}
                  </button>
                )}
              </div>
              <div className="mb-4 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span>👤 {data.post.authorName}</span>
                <span>{formatFull(data.post.createdAt)}</span>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{data.post.content}</div>
            </article>

            <section className="mt-6">
              <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                回复 <span className="text-slate-400 dark:text-slate-500">({data.replies.length})</span>
              </h2>

              {data.replies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  还没有人回复，快来抢沙发
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {data.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-600 dark:text-slate-300">👤 {reply.authorName}</span>
                          <span>{formatFull(reply.createdAt)}</span>
                        </div>
                        {user && user.phone === reply.authorPhone && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(reply.id)}
                            disabled={deletingReplyId === reply.id}
                            className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-50"
                          >
                            {deletingReplyId === reply.id ? '删除中...' : '删除'}
                          </button>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{reply.content}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">写下你的回复</h3>
                <span className="text-xs text-slate-400">{user ? `以 ${user.name} 的身份回复` : '登录后可回复'}</span>
              </div>
              <form onSubmit={handleReply}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  maxLength={REPLY_MAX}
                  rows={4}
                  placeholder={user ? '说点什么...' : '请先登录'}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <div className="mt-1 text-right text-xs text-slate-400">
                  {replyText.length}/{REPLY_MAX}
                </div>
                {replyErr && <p className="mt-1 text-sm text-red-500">{replyErr}</p>}
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={replying}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {replying ? '发送中...' : user ? '发送回复' : '登录后回复'}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </main>

      <Footer />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  )
}

export default TreeHoleDetail
