import { requireUser } from '@/lib/session'
import { getTimeZone } from '@/lib/timezone'
import { isPro } from '@/lib/data/subscription'
import { isAiConfigured } from '@/lib/ai/gemini'
import { getDashboardSummary } from '@/lib/data/dashboard'
import { listVocabulary } from '@/lib/data/vocabulary'
import { VocabularyList } from './vocabulary-list'
import { BulkImport } from './bulk-import'

const FREE_WORD_LIMIT = 100

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const user = await requireUser()
  const tz = await getTimeZone()
  const [entries, pro, stats] = await Promise.all([
    listVocabulary(user.id, tag),
    isPro(user.id),
    getDashboardSummary(user.id, tz),
  ])

  const atLimit = !pro && stats.totalVocabulary >= FREE_WORD_LIMIT

  return (
    <div className="space-y-10">
      <VocabularyList
        entries={entries}
        activeTag={tag}
        atLimit={atLimit}
        isPro={pro}
      />
      {pro && <BulkImport aiEnabled={isAiConfigured()} />}
    </div>
  )
}
