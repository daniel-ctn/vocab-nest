'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Loader2,
  Tag,
  MoreHorizontal,
  Trash2,
  Pencil,
  BookOpen,
  X,
  Filter,
} from 'lucide-react'
import { deleteVocabulary, searchVocabulary } from '@/lib/actions/vocabulary'
import type { VocabularyEntry } from '@/lib/contracts'

function VocabCard({
  entry,
  onDelete,
}: {
  entry: VocabularyEntry
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="group relative p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/vocabulary/${entry.id}`}
          className="text-left flex-1 min-w-0"
        >
          <h3 className="font-display text-lg font-semibold text-ink truncate">
            {entry.term}
          </h3>
          <p className="text-sm text-ink-secondary mt-1 line-clamp-2">
            {entry.definition}
          </p>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-md text-ink-tertiary hover:text-ink hover:bg-border-subtle transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-surface border border-border shadow-lg z-20 overflow-hidden">
                <Link
                  href={`/vocabulary/${entry.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-border-subtle"
                >
                  <BookOpen size={14} />
                  View
                </Link>
                <Link
                  href={`/vocabulary/${entry.id}/edit`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-border-subtle"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(entry.id)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error-subtle"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {entry.partOfSpeech && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-border-subtle text-xs font-medium text-ink-secondary">
            {entry.partOfSpeech}
          </span>
        )}
        {entry.language && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-border-subtle text-xs font-medium text-ink-secondary uppercase">
            {entry.language}
          </span>
        )}
        {entry.tags.slice(0, 3).map((tag) => (
          <Link
            key={tag}
            href={`/vocabulary?tag=${encodeURIComponent(tag)}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-subtle text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
          >
            <Tag size={10} />
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function VocabularyList({
  entries,
  activeTag,
}: {
  entries: VocabularyEntry[]
  activeTag?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<VocabularyEntry[] | null>(
    null
  )
  const [searching, setSearching] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchVocabulary({ query })
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    startTransition(async () => {
      try {
        await deleteVocabulary(id)
        router.refresh()
      } catch {
        alert('Failed to delete')
      }
    })
  }

  const displayed = searchResults ?? entries

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Vocabulary
          </h1>
          <p className="text-ink-secondary mt-1">
            {entries.length} word{entries.length !== 1 ? 's' : ''} collected
          </p>
        </div>
        <Link
          href="/vocabulary/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Add word
        </Link>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words, definitions, or tags..."
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
        {query && !searching && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
        {searching && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary animate-spin"
          />
        )}
      </div>

      {activeTag && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-subtle text-sm text-accent font-medium">
            <Filter size={12} />
            {activeTag}
          </div>
          <Link
            href="/vocabulary"
            className="text-sm text-ink-secondary hover:text-ink transition-colors"
          >
            Clear filter
          </Link>
        </div>
      )}

      {searchResults && (
        <p className="text-sm text-ink-secondary">
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-secondary">
            {query ? 'No matches found.' : 'No words yet.'}
          </p>
          {!query && (
            <Link
              href="/vocabulary/new"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-accent hover:underline"
            >
              <Plus size={14} />
              Add your first word
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayed.map((entry) => (
            <VocabCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
