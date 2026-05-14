'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <html>
      <body
        style={{
          minHeight: '100dvh',
          backgroundColor: '#fdfbf7',
          color: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Work Sans", sans-serif',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#6b6b6b',
              marginBottom: 16,
            }}
          >
            Something tore
          </div>
          <h2
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 44,
              fontWeight: 600,
              lineHeight: 1,
              margin: '0 0 24px',
              letterSpacing: '-0.02em',
            }}
          >
            A page came loose.
          </h2>
          <div
            style={{
              height: 1,
              background: '#d8d4cc',
              margin: '0 auto 24px',
              maxWidth: 320,
            }}
          />
          <p
            style={{
              fontFamily: '"Fraunces", serif',
              fontStyle: 'italic',
              fontSize: 17,
              color: '#6b6b6b',
              marginBottom: 28,
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: '#1a1a1a',
              color: '#fdfbf7',
              border: 0,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
