import { atomWithStorage } from 'jotai/utils'

export type AuthUser = {
  phone: string
  name: string
  avatar?: string
  loggedInAt: number
  token: string
}

// v2：加入 token 字段，旧版无 token 的本地缓存会被忽略，用户需要重新登录一次。
export const authUserAtom = atomWithStorage<AuthUser | null>('syg-auth-user-v2', null)
