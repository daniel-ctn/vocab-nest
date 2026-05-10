'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(30)

    const t1 = setTimeout(() => setProgress(70), 100)
    const t2 = setTimeout(() => setProgress(95), 300)
    const t3 = setTimeout(() => {
      setProgress(100)
      const t4 = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(t4)
    }, 500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent">
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          transition: 'width 200ms ease-out, opacity 300ms ease-out',
        }}
      />
    </div>
  )
}
