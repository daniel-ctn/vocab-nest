'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('vn-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('vn-theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className={className}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
