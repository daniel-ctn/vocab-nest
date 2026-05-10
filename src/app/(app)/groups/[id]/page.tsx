import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, BookOpen, Tag } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { getGroupWithVocabulary } from '@/lib/data/groups'
import { DeleteGroupButton } from './delete-group-button'
import type { VocabularyEntry } from '@/lib/contracts'

function VocabRow({ entry }: { entry: VocabularyEntry }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors">
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-ink truncate">
          {entry.term}
        </h3>
        <p className="text-sm text-ink-secondary mt-0.5 line-clamp-2">
          {entry.definition}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {entry.partOfSpeech && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-border-subtle text-xs font-medium text-ink-secondary">
              {entry.partOfSpeech}
            </span>
          )}
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-subtle text-xs font-medium text-accent"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  const data = await getGroupWithVocabulary(id, user.id)
  if (!data) {
    redirect('/groups')
  }

  const { group, items } = data

  return (
    <div className="space-y-6">
      <Link
        href="/groups"
        className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Back to groups
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {group.name}
          </h1>
          {group.description && (
            <p className="text-ink-secondary mt-1">{group.description}</p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary">
            <BookOpen size={14} />
            {items.length} word{items.length !== 1 ? 's' : ''}
          </div>
        </div>
        <DeleteGroupButton id={group.id} />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-secondary">No words in this group yet.</p>
          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-accent hover:underline"
          >
            Browse vocabulary
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((entry) => (
            <VocabRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
