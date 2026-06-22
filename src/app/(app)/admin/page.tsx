import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { getAdminStats } from '@/lib/data/admin'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { Stat } from '@/components/ui/stat'
import {
  SpecimenDefinition,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { toRoman } from '@/components/ui/roman'
import { cn } from '@/lib/cn'

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <Caps>{label}</Caps>
      <div className="mt-1.5 font-display text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[32px]">
        {value}
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()
  const maxWords = stats.topUsers[0]?.vocabularyCount ?? 0

  return (
    <div className="space-y-12">
      <Chapter
        eyebrow="Restricted"
        title="Admin"
        subtitle="Platform overview and aggregate stats."
      />

      {/* Platform totals — one lead figure, then a secondary ledger */}
      <section className="space-y-6">
        <Caps as="div">Platform totals</Caps>
        <Rule />
        <Stat
          value={stats.totalUsers.toLocaleString()}
          label="Registered learners"
          hint={
            stats.avgStreak > 0
              ? `averaging a ${stats.avgStreak}-day streak`
              : 'building their nests'
          }
        />
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 pt-2 sm:grid-cols-4">
          <MiniStat
            label="Total words"
            value={stats.totalVocabulary.toLocaleString()}
          />
          <MiniStat
            label="Groups"
            value={stats.totalGroups.toLocaleString()}
          />
          <MiniStat
            label="Practice sessions"
            value={stats.totalPracticeSessions.toLocaleString()}
          />
          <MiniStat
            label="Reviews completed"
            value={stats.totalReviews.toLocaleString()}
          />
        </div>
      </section>

      {/* Top learners — ranked, with a proportion bar against the leader */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <Caps as="div">Top learners</Caps>
          <span className="font-display text-[13px] italic text-ink-tertiary">
            by words collected
          </span>
        </div>
        <Rule />
        {stats.topUsers.length === 0 ? (
          <Marginalia>No learners have started a nest yet.</Marginalia>
        ) : (
          <ol className="divide-y divide-rule">
            {stats.topUsers.map((u, i) => {
              const lead = i === 0
              const pct =
                maxWords > 0
                  ? Math.round((u.vocabularyCount / maxWords) * 100)
                  : 0
              return (
                <li
                  key={u.id}
                  className="grid grid-cols-[24px_1fr_auto] items-baseline gap-4 py-5"
                >
                  <span
                    className={cn(
                      'font-display text-[15px] italic tabular-nums',
                      lead ? 'text-accent' : 'text-ink-tertiary'
                    )}
                  >
                    {toRoman(i + 1)}
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <SpecimenTerm size="sm">{u.name || u.email}</SpecimenTerm>
                    <SpecimenDefinition className="truncate">
                      {u.email}
                    </SpecimenDefinition>
                    <div className="h-[2px] w-full max-w-[220px] bg-rule">
                      <div
                        className={cn('h-[2px]', lead ? 'bg-accent' : 'bg-ink')}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-6">
                    <div className="text-right">
                      <div className="font-display text-[20px] font-semibold tabular-nums text-ink">
                        {u.vocabularyCount}
                      </div>
                      <Caps className="text-ink-tertiary">words</Caps>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[20px] font-semibold tabular-nums text-ink">
                        {u.streakDays}
                      </div>
                      <Caps className="text-ink-tertiary">d streak</Caps>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
