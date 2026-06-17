import { describe, it, expect } from 'vitest'
import { calculateNextReview } from '@/lib/data/practice'

describe('calculateNextReview', () => {
  it('graduates interval on Good (grade 2)', () => {
    const result = calculateNextReview(2, {
      intervalDays: 1,
      easeFactor: 250,
      consecutiveCorrect: 1,
    })
    expect(result.consecutiveCorrect).toBe(2)
    expect(result.intervalDays).toBe(3)
    expect(result.easeFactor).toBe(250)
  })

  it('multiplies interval by ease after the third Good review', () => {
    const result = calculateNextReview(2, {
      intervalDays: 3,
      easeFactor: 250,
      consecutiveCorrect: 2,
    })
    expect(result.consecutiveCorrect).toBe(3)
    expect(result.intervalDays).toBe(8)
    expect(result.easeFactor).toBe(250)
  })

  it('resets the card on Again (grade 0)', () => {
    const result = calculateNextReview(0, {
      intervalDays: 8,
      easeFactor: 250,
      consecutiveCorrect: 3,
    })
    expect(result.consecutiveCorrect).toBe(0)
    expect(result.intervalDays).toBe(1)
    expect(result.easeFactor).toBe(230)
  })

  it('does not let ease drop below 130', () => {
    const result = calculateNextReview(0, {
      intervalDays: 5,
      easeFactor: 140,
      consecutiveCorrect: 2,
    })
    expect(result.easeFactor).toBe(130)
  })

  it('advances gently and lowers ease on Hard (grade 1)', () => {
    const result = calculateNextReview(1, {
      intervalDays: 10,
      easeFactor: 250,
      consecutiveCorrect: 3,
    })
    expect(result.consecutiveCorrect).toBe(4)
    expect(result.intervalDays).toBe(12) // round(10 * 1.2)
    expect(result.easeFactor).toBe(235)
  })

  it('stretches interval and raises ease on Easy (grade 3)', () => {
    const result = calculateNextReview(3, {
      intervalDays: 10,
      easeFactor: 250,
      consecutiveCorrect: 3,
    })
    expect(result.consecutiveCorrect).toBe(4)
    expect(result.easeFactor).toBe(265) // 250 + 15
    expect(result.intervalDays).toBe(34) // round(10 * 2.65 * 1.3)
  })

  it('lets ease climb above the old 250 ceiling on repeated Easy', () => {
    const result = calculateNextReview(3, {
      intervalDays: 20,
      easeFactor: 345,
      consecutiveCorrect: 5,
    })
    expect(result.easeFactor).toBe(350) // capped at EASE_MAX, not 250
  })
})
