/**
 * Rooting — how firmly a word has taken hold, derived from its spaced-repetition
 * interval. Four tiers, lightest to deepest. Shared by the stats, group, and
 * word-detail views so the vocabulary and ink intensities never drift apart.
 */

export const ROOTING_TIERS = ['Fresh', 'Familiar', 'Steady', 'Rooted'] as const
export type RootingTier = (typeof ROOTING_TIERS)[number]

/** Ink-intensity classes per tier, index-aligned with ROOTING_TIERS. */
export const ROOTING_INTENSITY = [
  'bg-ink/20',
  'bg-ink/45',
  'bg-ink/65',
  'bg-ink',
] as const

/** Bucket a review interval (in days) into a rooting tier index 0–3. */
export function rootingTier(intervalDays: number): number {
  if (intervalDays <= 1) return 0
  if (intervalDays <= 6) return 1
  if (intervalDays <= 20) return 2
  return 3
}
