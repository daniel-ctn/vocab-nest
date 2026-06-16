import { describe, it, expect } from 'vitest'
import {
  dayKeyInTimeZone,
  startOfDayInTimeZone,
  endOfDayInTimeZone,
  previousDayKey,
  dayOfWeekFromKey,
  normalizeTimeZone,
} from '@/lib/date'

// 2026-06-16 18:00 UTC. In Asia/Ho_Chi_Minh (+7) it's already the 17th 01:00;
// in America/New_York (EDT, -4) it's still the 16th 14:00.
const instant = new Date('2026-06-16T18:00:00.000Z')

describe('dayKeyInTimeZone', () => {
  it('rolls forward east of UTC', () => {
    expect(dayKeyInTimeZone(instant, 'Asia/Ho_Chi_Minh')).toBe('2026-06-17')
  })

  it('stays behind west of UTC', () => {
    expect(dayKeyInTimeZone(instant, 'America/New_York')).toBe('2026-06-16')
  })

  it('matches UTC for UTC', () => {
    expect(dayKeyInTimeZone(instant, 'UTC')).toBe('2026-06-16')
  })
})

describe('startOfDayInTimeZone', () => {
  it('returns the UTC instant of local midnight (east of UTC)', () => {
    // Local midnight of 2026-06-17 in +7 is 2026-06-16T17:00:00Z.
    expect(startOfDayInTimeZone(instant, 'Asia/Ho_Chi_Minh').toISOString()).toBe(
      '2026-06-16T17:00:00.000Z'
    )
  })

  it('returns the UTC instant of local midnight (west of UTC)', () => {
    // Local midnight of 2026-06-16 in EDT (-4) is 2026-06-16T04:00:00Z.
    expect(startOfDayInTimeZone(instant, 'America/New_York').toISOString()).toBe(
      '2026-06-16T04:00:00.000Z'
    )
  })

  it('every instant in the day maps to the same start', () => {
    const a = startOfDayInTimeZone(
      new Date('2026-06-16T17:00:00.000Z'),
      'Asia/Ho_Chi_Minh'
    )
    const b = startOfDayInTimeZone(
      new Date('2026-06-17T16:59:59.000Z'),
      'Asia/Ho_Chi_Minh'
    )
    expect(a.toISOString()).toBe(b.toISOString())
  })
})

describe('endOfDayInTimeZone', () => {
  it('is the next local midnight', () => {
    const end = endOfDayInTimeZone(instant, 'Asia/Ho_Chi_Minh')
    expect(end.toISOString()).toBe('2026-06-17T17:00:00.000Z')
  })

  it('spans a 24h day for non-DST zones', () => {
    const start = startOfDayInTimeZone(instant, 'Asia/Ho_Chi_Minh')
    const end = endOfDayInTimeZone(instant, 'Asia/Ho_Chi_Minh')
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000)
  })
})

describe('previousDayKey', () => {
  it('steps back one day', () => {
    expect(previousDayKey('2026-06-17')).toBe('2026-06-16')
  })

  it('crosses month boundaries', () => {
    expect(previousDayKey('2026-03-01')).toBe('2026-02-28')
  })

  it('crosses year boundaries', () => {
    expect(previousDayKey('2026-01-01')).toBe('2025-12-31')
  })
})

describe('dayOfWeekFromKey', () => {
  it('computes weekday independent of machine timezone', () => {
    // 2024-01-07 was a Sunday.
    expect(dayOfWeekFromKey('2024-01-07')).toBe(0)
    expect(dayOfWeekFromKey('2024-01-08')).toBe(1)
  })
})

describe('normalizeTimeZone', () => {
  it('passes through valid zones', () => {
    expect(normalizeTimeZone('Asia/Ho_Chi_Minh')).toBe('Asia/Ho_Chi_Minh')
  })

  it('falls back to UTC for invalid or missing zones', () => {
    expect(normalizeTimeZone('Not/AZone')).toBe('UTC')
    expect(normalizeTimeZone(undefined)).toBe('UTC')
    expect(normalizeTimeZone(null)).toBe('UTC')
    expect(normalizeTimeZone('')).toBe('UTC')
  })
})
