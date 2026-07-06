import type React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="container mx-auto mb-4 mt-2 flex flex-col items-center px-6 text-xs text-gray-500 dark:text-gray-400">
      <p>© {new Date().getFullYear()} 思研阁 SI YAN GE · 专注数理化提分辅导</p>
    </footer>
  )
}

export default Footer
