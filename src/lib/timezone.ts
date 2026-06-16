import { cookies } from 'next/headers'
import { normalizeTimeZone } from '@/lib/date'

export const TIMEZONE_COOKIE = 'vn-tz'

/**
 * The visitor's IANA timezone, read from the cookie set by <TimeZoneSync />.
 * Falls back to UTC before the client has reported it (or if it is invalid).
 */
export async function getTimeZone(): Promise<string> {
  const store = await cookies()
  return normalizeTimeZone(store.get(TIMEZONE_COOKIE)?.value)
}
