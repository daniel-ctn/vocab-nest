import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { getVocabularyDetail } from '@/lib/data/vocabulary'
import { SpeakButton } from '@/components/speak-button'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { DropCap } from '@/components/ui/drop-cap'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { cn } from '@/lib/cn'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// A word takes root over four tiers as its review interval lengthens.
const TIER_NAMES = ['Fresh', 'Familiar', 'Steady', 'Rooted'] as const
const TIER_INTENSITY = ['bg-ink/20', 'bg-ink/45', 'bg-ink/65', 'bg-ink'] as const
const TIER_BLURB = [
  'Newly added — still finding its footing.',
  'Coming back to you more often than not.',
  'Holding steady across longer gaps.',
  'Deeply rooted — it rarely slips.',
] as const

function rootingTier(intervalDays: number): number {
  if (intervalDays <= 1) return 0
  if (intervalDays <= 6) return 1
  if (intervalDays <= 20) return 2
  return 3
}

function Figure({
  label,
  value,
  active = false,
}: {
  label: string
  value: React.ReactNode
  active?: boolean
}) {
  return (
    <div>
      <Caps>{label}</Caps>
      <div
        className={cn(
          'mt-1.5 font-display text-[26px] font-semibold leading-none tabular-nums sm:text-[30px]',
          active ? 'text-accent' : 'text-ink'
        )}
      >
        {value}
      </div>
    </div>
  )
}

export default async function VocabularyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const data = await getVocabularyDetail(id, user.id)
  if (!data) {
    redirect('/vocabulary')
  }

  const { entry, groupNames, stats } = data
  const isDue = stats ? new Date(stats.nextReviewAt) <= new Date() : true

  return (
    <article className="space-y-12">
      <Link
        href="/vocabulary"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        Vocabulary
      </Link>

      {/* Headword block — dictionary-entry treatment */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {entry.partOfSpeech && (
            <Marginalia>{entry.partOfSpeech}.</Marginalia>
          )}
          {entry.language && (
            <Caps className="text-ink-tertiary">{entry.language}</Caps>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-3 sm:gap-4">
          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl">
            {entry.term}
          </h1>
          <SpeakButton
            text={entry.term}
            className="mb-2 -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-border-subtle hover:text-ink"
          />
        </div>
        {entry.pronunciation && (
          <p className="font-mono text-[13px] lowercase tracking-wide text-ink-tertiary">
            {entry.pronunciation}
          </p>
        )}
        <Rule animate />
        <div className="flex items-center justify-between gap-3">
          <Marginalia>
            Added {fmtDate(entry.createdAt)}
            {entry.updatedAt !== entry.createdAt &&
              ` · revised ${fmtDate(entry.updatedAt)}`}
          </Marginalia>
          <ButtonLink
            href={`/vocabulary/${entry.id}/edit`}
            variant="ghost"
            size="sm"
          >
            <Pencil size={13} />
            Edit
          </ButtonLink>
        </div>
      </header>

      {/* Definition with drop cap */}
      <section className="space-y-3">
        <Caps as="div">Definition</Caps>
        <DropCap>{entry.definition}</DropCap>
      </section>

      {/* Examples — numbered, hanging indent */}
      {entry.examples.length > 0 && (
        <section className="space-y-4">
          <Caps as="div">Examples</Caps>
          <ol className="space-y-3">
            {entry.examples.map((example, i) => (
              <li
                key={i}
                className="grid grid-cols-[28px_1fr] gap-3 text-[16px] leading-relaxed text-ink"
              >
                <span className="text-right font-display text-[14px] italic text-ink-tertiary">
                  {i + 1}.
                </span>
                <span className="font-display italic">{example}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Synonyms & antonyms */}
      {(entry.synonyms.length > 0 || entry.antonyms.length > 0) && (
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {entry.synonyms.length > 0 && (
            <div className="space-y-3">
              <Caps as="div">Synonyms</Caps>
              <p className="font-display text-[16px] italic leading-relaxed text-ink">
                {entry.synonyms.join(', ')}
              </p>
            </div>
          )}
          {entry.antonyms.length > 0 && (
            <div className="space-y-3">
              <Caps as="div">Antonyms</Caps>
              <p className="font-display text-[16px] italic leading-relaxed text-ink">
                {entry.antonyms.join(', ')}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Etymology */}
      {entry.etymology && (
        <section className="space-y-3">
          <Caps as="div">Etymology</Caps>
          <p className="font-display text-[16px] italic leading-relaxed text-ink-secondary">
            {entry.etymology}
          </p>
        </section>
      )}

      {/* Mnemonic */}
      {entry.mnemonic && (
        <section className="space-y-3">
          <Caps as="div">Mnemonic</Caps>
          <p className="text-[15px] leading-relaxed text-ink">
            {entry.mnemonic}
          </p>
        </section>
      )}

      {/* Notes */}
      {entry.notes && (
        <section className="space-y-3">
          <Caps as="div">Notes</Caps>
          <p className="text-[15px] leading-relaxed text-ink-secondary">
            {entry.notes}
          </p>
        </section>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <section className="space-y-3">
          <Caps as="div">Tags</Caps>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {entry.tags.map((tag) => (
              <Link
                key={tag}
                href={`/vocabulary?tag=${encodeURIComponent(tag)}`}
                className="text-[13px] text-ink underline decoration-rule decoration-[1.5px] underline-offset-[5px] hover:decoration-accent"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Groups */}
      {groupNames.length > 0 && (
        <section className="space-y-3">
          <Caps as="div">Groups</Caps>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {groupNames.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="font-display text-[15px] italic text-ink underline decoration-rule decoration-[1.5px] underline-offset-[5px] hover:decoration-accent"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Review ledger */}
      {stats && (
        <section className="space-y-6">
          <Caps as="div">Review ledger</Caps>
          <Rule />

          {/* Standing — the word's rooting tier, led, with a gauge */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Caps className="text-ink-tertiary">Standing</Caps>
              <div className="mt-1 font-display text-[34px] font-semibold leading-none tracking-tight text-ink">
                {TIER_NAMES[rootingTier(stats.intervalDays)]}
              </div>
              <Marginalia className="mt-1.5">
                {TIER_BLURB[rootingTier(stats.intervalDays)]}
              </Marginalia>
            </div>
            <div className="w-full sm:max-w-[210px]">
              <div
                className="flex h-2 gap-[3px]"
                role="img"
                aria-label={`Rooting: ${TIER_NAMES[rootingTier(stats.intervalDays)]}`}
              >
                {TIER_NAMES.map((name, i) => (
                  <div
                    key={name}
                    className={cn(
                      'flex-1',
                      i <= rootingTier(stats.intervalDays)
                        ? TIER_INTENSITY[i]
                        : 'bg-rule/50'
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                <Caps className="text-ink-tertiary">Fresh</Caps>
                <Caps className="text-ink-tertiary">Rooted</Caps>
              </div>
            </div>
          </div>

          {/* Secondary figures */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            <Figure label="Accuracy" value={`${stats.accuracy}%`} />
            <Figure label="Reviews" value={stats.totalReviews} />
            <Figure
              label="Run"
              value={stats.consecutiveCorrect}
              active={stats.consecutiveCorrect > 0}
            />
            <Figure label="Interval" value={`${stats.intervalDays}d`} />
          </div>

          <Rule />
          <div className="flex items-center justify-between gap-3">
            <Marginalia>
              {isDue ? (
                <span className="text-accent">Due for review.</span>
              ) : (
                <>Next review on {fmtDate(stats.nextReviewAt)}.</>
              )}
            </Marginalia>
            {isDue && (
              <ButtonLink href="/practice" variant="accent" size="sm">
                Start practice →
              </ButtonLink>
            )}
          </div>
        </section>
      )}
    </article>
  )
}
