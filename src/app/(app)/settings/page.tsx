import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { ArrowLeft, Download } from 'lucide-react'
import { requireUser } from '@/lib/session'
import { db } from '@/lib/db'
import { userStats } from '@/lib/db/schema'
import { isPro } from '@/lib/data/subscription'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const user = await requireUser()
  const [stats, pro] = await Promise.all([
    db
      .select({
        dailyGoal: userStats.dailyGoal,
        emailReminders: userStats.emailReminders,
        reminderHour: userStats.reminderHour,
        streakFreezes: userStats.streakFreezes,
      })
      .from(userStats)
      .where(eq(userStats.userId, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    isPro(user.id),
  ])

  return (
    <div className="space-y-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <Chapter
        eyebrow="Account"
        title="Preferences"
        subtitle="Tune your daily goal and manage your collection."
      />

      <SettingsForm
        name={user.name ?? ''}
        dailyGoal={stats?.dailyGoal ?? 10}
        emailReminders={stats?.emailReminders ?? true}
        reminderHour={stats?.reminderHour ?? 9}
      />

      {/* Export */}
      <section className="space-y-4">
        <Caps as="div">Export your data</Caps>
        <Rule />
        {pro ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/api/export?format=json"
              className="inline-flex items-center gap-2 text-[13px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
            >
              <Download size={13} />
              Download JSON
            </Link>
            <span className="text-ink-tertiary">·</span>
            <Link
              href="/api/export?format=csv"
              className="inline-flex items-center gap-2 text-[13px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
            >
              <Download size={13} />
              Download CSV
            </Link>
          </div>
        ) : (
          <Marginalia>
            Exporting your vocabulary is a{' '}
            <Link
              href="/upgrade"
              className="not-italic font-semibold text-accent underline decoration-accent decoration-[1.5px] underline-offset-[5px]"
            >
              Pro
            </Link>{' '}
            feature.
          </Marginalia>
        )}
      </section>
    </div>
  )
}
