'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COOKIE = 'vn-tz'

/**
 * Reports the browser's IANA timezone to the server via a cookie so that
 * server-rendered "today / streak / due" calculations use the user's local
 * day. Refreshes once when first set (or when the user changes timezone) so
 * the current page reflects the correct day immediately.
 */
export function TimeZoneSync() {
  const router = useRouter()

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!tz) return

    const current = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${COOKIE}=`))
      ?.split('=')[1]

    if (current === tz) return

    document.cookie = `${COOKIE}=${tz}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }, [router])

  return null
}
