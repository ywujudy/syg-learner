import Layout from '../../components/Layout'
import type React from 'react'

export const FriendLinks: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-blue-600">友情链接</h1>
        <p className="text-gray-500 dark:text-gray-400">敬请期待</p>
      </div>
    </Layout>
  )
}
