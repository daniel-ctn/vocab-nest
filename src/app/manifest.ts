import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vocab Nest — a commonplace book for words',
    short_name: 'Vocab Nest',
    description:
      'Collect words, bind them into groups, and practise daily with spaced repetition. A calm, deliberate vocabulary keeper.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f2e7',
    theme_color: '#f7f2e7',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
