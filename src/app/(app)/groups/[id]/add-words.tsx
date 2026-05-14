'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2, Plus, Search, X } from 'lucide-react'
import { addVocabularyToGroup } from '@/lib/actions/groups'
import { Button } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import type { VocabularyEntry } from '@/lib/contracts'

export function AddWordsToGroup({
  groupId,
  words,
}: {
  groupId: string
  words: VocabularyEntry[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const filtered = words.filter(
    (w) =>
      w.term.toLowerCase().includes(query.toLowerCase()) ||
      w.definition.toLowerCase().includes(query.toLowerCase())
  )

  function handleAdd(vocabularyId: string) {
    setAddingId(vocabularyId)
    startTransition(async () => {
      try {
        await addVocabularyToGroup(vocabularyId, groupId)
        setAddedIds((prev) => new Set(prev).add(vocabularyId))
      } catch {
        alert('Failed to add word')
      } finally {
        setAddingId(null)
      }
    })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus size={13} />
        Add words
      </Button>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <Caps as="div">Add words to this group</Caps>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-tertiary hover:text-ink"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
      <Rule />

      <div className="relative">
        <Search size={14} className="absolute bottom-2.5 left-0 text-ink-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vocabulary"
          className="w-full border-0 border-b border-rule bg-transparent py-2 pl-6 text-[15px] text-ink placeholder:font-display placeholder:italic placeholder:text-ink-tertiary focus:border-ink focus:outline-none transition-colors"
        />
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-rule">
        {filtered.length === 0 ? (
          <Marginalia>
            {query
              ? 'No matches found.'
              : 'All words are already in this group.'}
          </Marginalia>
        ) : (
          filtered.map((word) => {
            const isAdded = addedIds.has(word.id)
            return (
              <div
                key={word.id}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[16px] font-semibold text-ink truncate">
                    {word.term}
                  </p>
                  <p className="font-display italic text-[13px] text-ink-secondary truncate">
                    {word.definition}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(word.id)}
                  disabled={isPending || isAdded}
                  className="shrink-0 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  {addingId === word.id ? (
                    <Loader2 size={12} className="animate-spin text-ink-tertiary" />
                  ) : isAdded ? (
                    <>
                      <Check size={12} className="text-accent" />
                      <span className="text-accent">Added</span>
                    </>
                  ) : (
                    <span className="text-ink hover:text-accent">Add</span>
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
