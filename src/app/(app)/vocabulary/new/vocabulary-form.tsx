'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X, Save } from 'lucide-react'
import { createVocabulary, updateVocabulary } from '@/lib/actions/vocabulary'
import type { CreateVocabularyRequest, VocabularyEntry } from '@/lib/contracts'

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  function add() {
    const val = input.trim()
    if (!val) return
    if (!tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput('')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-subtle text-xs font-medium text-accent"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="hover:text-accent-hover"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-border-subtle text-ink-secondary hover:bg-border transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function ExampleInput({
  examples,
  onChange,
}: {
  examples: string[]
  onChange: (examples: string[]) => void
}) {
  const [input, setInput] = useState('')

  function add() {
    const val = input.trim()
    if (!val) return
    onChange([...examples, val])
    setInput('')
  }

  return (
    <div className="space-y-2">
      {examples.map((ex, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-3 rounded-lg bg-border-subtle text-sm text-ink"
        >
          <span className="flex-1">{ex}</span>
          <button
            onClick={() => onChange(examples.filter((_, idx) => idx !== i))}
            className="text-ink-tertiary hover:text-error shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add an example sentence"
          className="flex-1 px-3.5 py-2 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-border-subtle text-ink-secondary hover:bg-border transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

type VocabularyFormProps = {
  mode: 'create' | 'edit'
  entry?: VocabularyEntry
  extraActions?: ReactNode
}

export function VocabularyForm({
  mode,
  entry,
  extraActions,
}: VocabularyFormProps) {
  const router = useRouter()
  const [term, setTerm] = useState(entry?.term ?? '')
  const [definition, setDefinition] = useState(entry?.definition ?? '')
  const [language, setLanguage] = useState(entry?.language ?? '')
  const [partOfSpeech, setPartOfSpeech] = useState(entry?.partOfSpeech ?? '')
  const [examples, setExamples] = useState<string[]>(entry?.examples ?? [])
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!term.trim() || !definition.trim()) return

    const payload: CreateVocabularyRequest = {
      term: term.trim(),
      definition: definition.trim(),
      language: language.trim() || undefined,
      partOfSpeech: partOfSpeech.trim() || undefined,
      examples: examples.length > 0 ? examples : undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createVocabulary(payload)
        } else if (entry) {
          await updateVocabulary(entry.id, payload)
        }
        router.push('/vocabulary')
      } catch {
        alert('Failed to save')
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="font-display text-3xl font-semibold text-ink mb-6">
        {mode === 'create' ? 'Add a word' : 'Edit word'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Word or phrase
          </label>
          <input
            required
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            placeholder="e.g., Serendipity"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Definition
          </label>
          <textarea
            required
            rows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
            placeholder="e.g., The occurrence of events by chance in a happy way"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Language
            </label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="e.g., en"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Part of speech
            </label>
            <input
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="e.g., noun"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Examples
          </label>
          <ExampleInput examples={examples} onChange={setExamples} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Tags
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Add a tag and press Enter"
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            <Save size={16} />
            {mode === 'create' ? 'Save word' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-ink-secondary hover:bg-border-subtle transition-colors"
          >
            Cancel
          </button>
          {extraActions}
        </div>
      </form>
    </div>
  )
}
