import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Fraunces, Work_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// The "apparatus" voice — labels, numerals, folios, metadata. A ledger hand
// set against the Fraunces display serif.
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vocab Nest — a commonplace book for words',
  description:
    'Collect words, bind them into groups, and practise daily with spaced repetition. A calm, deliberate vocabulary keeper.',
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
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  )
}
