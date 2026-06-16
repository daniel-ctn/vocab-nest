/**
 * Day-key utilities for computing "the user's calendar day" in a given IANA
 * timezone, plus the UTC instant bounds of that day.
 *
 * All "today / streak / due-window" logic funnels through here so that server
 * components and server actions agree on what day it is for the user, instead
 * of mixing UTC (`toISOString().slice(0,10)`) with the server's local time.
 */

/** `YYYY-MM-DD` for the calendar day `date` falls on in `timeZone`. */
export function dayKeyInTimeZone(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Minutes `timeZone` is ahead of UTC at the given instant (e.g. +420 for
 * Asia/Ho_Chi_Minh, -240 for America/New_York in DST). Sampling at `date`
 * makes it DST-correct.
 */
function offsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)

  const map: Record<string, number> = {}
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = Number(part.value)
  }

  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour,
    map.minute,
    map.second
  )
  return Math.round((asUTC - date.getTime()) / 60000)
}

/** UTC instant of the local midnight that begins the calendar day of `now`. */
export function startOfDayInTimeZone(now: Date, timeZone: string): Date {
  const key = dayKeyInTimeZone(now, timeZone)
  const utcMidnight = new Date(`${key}T00:00:00.000Z`)
  const offset = offsetMinutes(utcMidnight, timeZone)
  return new Date(utcMidnight.getTime() - offset * 60000)
}

/** UTC instant of the next local midnight (exclusive end of `now`'s day). */
export function endOfDayInTimeZone(now: Date, timeZone: string): Date {
  const start = startOfDayInTimeZone(now, timeZone)
  // Jump ~26h to clear any DST transition (23h or 25h day), then snap to that
  // day's start — the next local midnight.
  return startOfDayInTimeZone(
    new Date(start.getTime() + 26 * 60 * 60 * 1000),
    timeZone
  )
}

/** Previous calendar day for a `YYYY-MM-DD` key. Timezone-independent. */
export function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().slice(0, 10)
}

/** Day of week (0=Sun … 6=Sat) for a `YYYY-MM-DD` key. Timezone-independent. */
export function dayOfWeekFromKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** Returns `tz` if it is a valid IANA zone, otherwise `'UTC'`. */
export function normalizeTimeZone(tz: string | undefined | null): string {
  if (!tz) return 'UTC'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return tz
  } catch {
    return 'UTC'
  }
}
