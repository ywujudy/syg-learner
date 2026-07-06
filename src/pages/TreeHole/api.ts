import type { AuthUser } from '@/store/authAtom'

export type PostSummary = {
  id: number
  authorPhone: string
  authorName: string
  title: string
  content: string
  createdAt: number
  lastActiveAt: number
  replyCount: number
}

export type ReplyRecord = {
  id: number
  postId: number
  authorPhone: string
  authorName: string
  content: string
  createdAt: number
}

export type PostListResp = {
  page: number
  pageSize: number
  total: number
  posts: PostSummary[]
}

export type PostDetailResp = {
  post: PostSummary
  replies: ReplyRecord[]
}

const jsonHeaders = { 'Content-Type': 'application/json' }

const handle = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `请求失败 (${res.status})`)
  }
  return (await res.json()) as T
}

const authHeader = (user: AuthUser): Record<string, string> => ({
  Authorization: `Bearer ${user.token}`,
})

export const fetchPosts = (page: number) => fetch(`/api/tree-hole/posts?page=${page}`).then((r) => handle<PostListResp>(r))

export const fetchPost = (id: number) => fetch(`/api/tree-hole/posts/${id}`).then((r) => handle<PostDetailResp>(r))

export const createPost = (user: AuthUser, payload: { title: string; content: string }) =>
  fetch('/api/tree-hole/posts', {
    method: 'POST',
    headers: { ...jsonHeaders, ...authHeader(user) },
    body: JSON.stringify(payload),
  }).then((r) => handle<PostSummary>(r))

export const deletePost = (user: AuthUser, id: number) =>
  fetch(`/api/tree-hole/posts/${id}`, {
    method: 'DELETE',
    headers: authHeader(user),
  }).then((r) => handle<{ ok: true }>(r))

export const createReply = (user: AuthUser, postId: number, content: string) =>
  fetch(`/api/tree-hole/posts/${postId}/replies`, {
    method: 'POST',
    headers: { ...jsonHeaders, ...authHeader(user) },
    body: JSON.stringify({ content }),
  }).then((r) => handle<ReplyRecord>(r))

export const deleteReply = (user: AuthUser, id: number) =>
  fetch(`/api/tree-hole/replies/${id}`, {
    method: 'DELETE',
    headers: authHeader(user),
  }).then((r) => handle<{ ok: true }>(r))
