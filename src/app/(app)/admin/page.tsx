import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { getAdminStats } from '@/lib/data/admin'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import {
  Specimen,
  SpecimenBody,
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { Stat, StatRow } from '@/components/ui/stat'

export default async function AdminPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()

  return (
    <div className="space-y-12">
      <Chapter
        eyebrow="Restricted"
        title="Admin"
        subtitle="Platform overview and aggregate stats."
      />

      <section className="space-y-5">
        <Caps as="div">Platform totals</Caps>
        <Rule />
        <StatRow cols={3}>
          <Stat value={stats.totalUsers} label="Users" />
          <Stat
            value={stats.totalVocabulary.toLocaleString()}
            label="Total words"
          />
          <Stat value={stats.totalGroups} label="Groups" />
          <Stat
            value={stats.totalPracticeSessions.toLocaleString()}
            label="Practice sessions"
          />
          <Stat
            value={stats.totalReviews.toLocaleString()}
            label="Reviews completed"
          />
          <Stat value={stats.avgStreak} label="Avg streak" />
        </StatRow>
      </section>

      <section className="space-y-4">
        <Caps as="div">Top learners</Caps>
        <Rule />
        {stats.topUsers.length === 0 ? (
          <Marginalia>No users yet.</Marginalia>
        ) : (
          <SpecimenList>
            {stats.topUsers.map((u) => (
              <Specimen key={u.id}>
                <SpecimenBody>
                  <SpecimenTerm size="sm">{u.name || u.email}</SpecimenTerm>
                  <SpecimenDefinition className="truncate">
                    {u.email}
                  </SpecimenDefinition>
                </SpecimenBody>
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
              </Specimen>
            ))}
          </SpecimenList>
        )}
      </section>
    </div>
  )
}
