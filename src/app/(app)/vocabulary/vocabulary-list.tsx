'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { deleteVocabulary, searchVocabulary } from '@/lib/actions/vocabulary'
import { ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Marginalia } from '@/components/ui/marginalia'
import {
  Specimen,
  SpecimenAside,
  SpecimenBody,
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { toRoman } from '@/components/ui/roman'
import type { VocabularyEntry } from '@/lib/contracts'

function EntryRow({
  entry,
  onDelete,
}: {
  entry: VocabularyEntry
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="group relative">
      <Link
        href={`/vocabulary/${entry.id}`}
        className="block transition-colors hover:[&_[data-specimen-term]]:text-accent"
      >
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-3">
              <SpecimenTerm>{entry.term}</SpecimenTerm>
              {entry.partOfSpeech && (
                <Marginalia className="shrink-0">
                  {entry.partOfSpeech}.
                </Marginalia>
              )}
            </div>
            <SpecimenDefinition className="mt-1 line-clamp-2">
              {entry.definition}
            </SpecimenDefinition>
            {entry.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {entry.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-tertiary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {entry.language && (
            <SpecimenAside>
              <Caps className="text-ink-tertiary">{entry.language}</Caps>
            </SpecimenAside>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setMenuOpen((v) => !v)
        }}
        className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-sm text-ink-tertiary opacity-0 transition-opacity hover:bg-border-subtle hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
        aria-label="More"
      >
        <MoreHorizontal size={14} />
      </button>
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-8 z-40 w-40 border border-rule bg-cream py-1 shadow-lg">
            <Link
              href={`/vocabulary/${entry.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
              onClick={() => setMenuOpen(false)}
            >
              <Pencil size={13} />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onDelete(entry.id)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-error hover:bg-error-subtle"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function VocabularyList({
  entries,
  activeTag,
  atLimit,
  isPro,
}: {
  entries: VocabularyEntry[]
  activeTag?: string
  atLimit?: boolean
  isPro?: boolean
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
    <div className="space-y-10">
      <Chapter
        eyebrow={`Part ${toRoman(2)}`}
        title="Vocabulary"
        subtitle={`${entries.length} word${entries.length !== 1 ? 's' : ''} collected.`}
        aside={
          <div className="flex items-center gap-3">
            {!isPro && (
              <Link
                href="/upgrade"
                className="text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary hover:text-ink"
              >
                Upgrade
              </Link>
            )}
            {atLimit ? (
              <ButtonLink href="/upgrade" variant="outline">
                At limit
              </ButtonLink>
            ) : (
              <ButtonLink href="/vocabulary/new" variant="primary">
                Add a word
              </ButtonLink>
            )}
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute bottom-2.5 left-0 text-ink-tertiary"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words, definitions, tags"
          className="w-full border-0 border-b border-rule bg-transparent py-2 pl-6 pr-8 text-[15px] text-ink placeholder:font-display placeholder:italic placeholder:text-ink-tertiary focus:border-ink focus:outline-none transition-colors"
        />
        {query && !searching && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute bottom-2 right-0 text-ink-tertiary hover:text-ink"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
        {searching && (
          <Loader2
            size={14}
            className="absolute bottom-2 right-0 animate-spin text-ink-tertiary"
          />
        )}
      </div>

      {activeTag && (
        <Marginalia>
          Filtered by tag{' '}
          <span className="font-semibold text-ink not-italic">{activeTag}</span>
          .{' '}
          <Link
            href="/vocabulary"
            className="not-italic text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px]"
          >
            Clear
          </Link>
        </Marginalia>
      )}

      {searchResults && (
        <Marginalia>
          {searchResults.length} result
          {searchResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;.
        </Marginalia>
      )}

      {atLimit && (
        <Marginalia className="text-accent">
          You&apos;ve reached the free plan limit. {' '}
          <Link
            href="/upgrade"
            className="not-italic font-semibold text-accent underline decoration-accent decoration-[1.5px] underline-offset-[5px]"
          >
            Upgrade to Pro
          </Link>{' '}
          for unlimited vocabulary.
        </Marginalia>
      )}

      {displayed.length === 0 ? (
        <div className="py-16 text-center">
          <div className="font-display text-5xl text-ink-tertiary">—</div>
          <p className="mt-3 font-display italic text-[15px] text-ink-tertiary">
            {query ? 'No matches.' : 'No words yet.'}
          </p>
          {!query && (
            <Link
              href="/vocabulary/new"
              className="mt-6 inline-block text-[13px] text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px] hover:decoration-accent-hover"
            >
              Add your first word →
            </Link>
          )}
        </div>
      ) : (
        <SpecimenList>
          {displayed.map((entry) => (
            <EntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </SpecimenList>
      )}
    </div>
  )
}
