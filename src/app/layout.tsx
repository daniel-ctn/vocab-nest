import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Fraunces, Work_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vocab Nest',
  description: 'A thoughtful space for building your vocabulary',
}

const themeScript = `
  (function(){
    try {
      var saved = localStorage.getItem('vn-theme');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var dark = saved ? saved === 'dark' : prefersDark;
      if (dark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })()
`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  )
}
