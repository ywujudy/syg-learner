import logo from '@/assets/syg-logo.jpg'
import type { PropsWithChildren, ReactNode } from 'react'
import type React from 'react'
import { NavLink } from 'react-router-dom'

type Props = PropsWithChildren<{ extraAction?: ReactNode }>

const Header: React.FC<Props> = ({ children, extraAction }) => {
  return (
    <header className="container z-20 mx-auto w-full px-10 py-6">
      <div className="flex w-full flex-col items-center justify-between space-y-3 lg:flex-row lg:space-y-0">
        <NavLink className="flex items-center text-2xl font-bold text-blue-600 no-underline hover:no-underline lg:text-4xl" to="/">
          <img src={logo} className="mr-3 h-16 w-16 rounded" alt="思研阁 Logo" />
          <h1>思研阁</h1>
        </NavLink>
        <div className="flex items-center space-x-3">
          <nav className="my-card on element flex w-auto content-center items-center justify-end space-x-3 rounded-xl bg-white p-4 transition-colors duration-300 dark:bg-gray-800">
            {children}
          </nav>
          {extraAction}
        </div>
      </div>
    </header>
  )
}

export default Header
