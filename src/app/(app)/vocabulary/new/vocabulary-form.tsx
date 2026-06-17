'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Sparkles, X } from 'lucide-react'
import { createVocabulary, updateVocabulary } from '@/lib/actions/vocabulary'
import { enrichVocabulary } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Field, Input, Label, Textarea } from '@/components/ui/input'
import { Rule } from '@/components/ui/rule'
import { toRoman } from '@/components/ui/roman'
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
    <div className="space-y-3">
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-ink-tertiary hover:text-accent"
                aria-label={`Remove ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
        />
        <Button
          type="button"
          onClick={add}
          variant="ghost"
          size="sm"
          className="mb-1"
        >
          <Plus size={13} />
          Add
        </Button>
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
    <div className="space-y-4">
      {examples.length > 0 && (
        <ol className="space-y-2.5">
          {examples.map((ex, i) => (
            <li
              key={i}
              className="grid grid-cols-[28px_1fr_auto] items-baseline gap-3 text-[15px] leading-relaxed text-ink"
            >
              <span className="text-right font-display text-[13px] italic text-ink-tertiary">
                {i + 1}.
              </span>
              <span className="font-display italic">{ex}</span>
              <button
                type="button"
                onClick={() => onChange(examples.filter((_, idx) => idx !== i))}
                className="text-ink-tertiary hover:text-accent"
                aria-label="Remove example"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="flex items-end gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add an example sentence"
        />
        <Button
          type="button"
          onClick={add}
          variant="ghost"
          size="sm"
          className="mb-1"
        >
          <Plus size={13} />
          Add
        </Button>
      </div>
    </div>
  )
}

type VocabularyFormProps = {
  mode: 'create' | 'edit'
  entry?: VocabularyEntry
  extraActions?: ReactNode
  canUseAi?: boolean
}

export function VocabularyForm({
  mode,
  entry,
  extraActions,
  canUseAi,
}: VocabularyFormProps) {
  const router = useRouter()
  const [term, setTerm] = useState(entry?.term ?? '')
  const [definition, setDefinition] = useState(entry?.definition ?? '')
  const [language, setLanguage] = useState(entry?.language ?? '')
  const [partOfSpeech, setPartOfSpeech] = useState(entry?.partOfSpeech ?? '')
  const [pronunciation, setPronunciation] = useState(entry?.pronunciation ?? '')
  const [examples, setExamples] = useState<string[]>(entry?.examples ?? [])
  const [synonyms, setSynonyms] = useState<string[]>(entry?.synonyms ?? [])
  const [antonyms, setAntonyms] = useState<string[]>(entry?.antonyms ?? [])
  const [etymology, setEtymology] = useState(entry?.etymology ?? '')
  const [mnemonic, setMnemonic] = useState(entry?.mnemonic ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [isPending, startTransition] = useTransition()
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  function handleAutofill() {
    const t = term.trim()
    if (!t || aiLoading) return
    setAiError(null)
    setAiLoading(true)
    enrichVocabulary(t, language.trim() || undefined)
      .then((d) => {
        // Only fill fields the user hasn't already written.
        if (!definition.trim() && d.definition) setDefinition(d.definition)
        if (!partOfSpeech.trim() && d.partOfSpeech)
          setPartOfSpeech(d.partOfSpeech)
        if (!pronunciation.trim() && d.pronunciation)
          setPronunciation(d.pronunciation)
        if (examples.length === 0 && d.examples.length > 0)
          setExamples(d.examples)
        if (synonyms.length === 0 && d.synonyms.length > 0)
          setSynonyms(d.synonyms)
        if (antonyms.length === 0 && d.antonyms.length > 0)
          setAntonyms(d.antonyms)
        if (!etymology.trim() && d.etymology) setEtymology(d.etymology)
        if (!mnemonic.trim() && d.mnemonic) setMnemonic(d.mnemonic)
      })
      .catch((e) =>
        setAiError(e instanceof Error ? e.message : 'Auto-fill failed.')
      )
      .finally(() => setAiLoading(false))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!term.trim() || !definition.trim()) return

    const payload: CreateVocabularyRequest = {
      term: term.trim(),
      definition: definition.trim(),
      language: language.trim() || undefined,
      partOfSpeech: partOfSpeech.trim() || undefined,
      pronunciation: pronunciation.trim() || undefined,
      examples: examples.length > 0 ? examples : undefined,
      synonyms: synonyms.length > 0 ? synonyms : undefined,
      antonyms: antonyms.length > 0 ? antonyms : undefined,
      etymology: etymology.trim() || undefined,
      mnemonic: mnemonic.trim() || undefined,
      notes: notes.trim() || undefined,
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
    <div className="space-y-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] font-semibold text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <Chapter
        eyebrow={`Chapter ${toRoman(mode === 'create' ? 1 : 2)}`}
        title={mode === 'create' ? 'A new word' : 'Edit word'}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <Field>
          <Label htmlFor="term">Word or phrase</Label>
          <Input
            id="term"
            required
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g., Serendipity"
            className="text-[22px] font-display font-semibold placeholder:font-display placeholder:not-italic placeholder:text-ink-tertiary"
          />
          {canUseAi && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleAutofill}
                disabled={!term.trim() || aiLoading}
                className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] font-semibold text-accent transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {aiLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                Auto-fill with AI
              </button>
              {aiError && (
                <span className="font-display text-[12px] italic text-error">
                  {aiError}
                </span>
              )}
            </div>
          )}
        </Field>

        <Field>
          <Label htmlFor="definition">Definition</Label>
          <Textarea
            id="definition"
            required
            rows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="e.g., The occurrence of events by chance in a happy way"
            className="font-display italic text-[17px]"
          />
        </Field>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Field>
            <Label htmlFor="lang">Language</Label>
            <Input
              id="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en"
            />
          </Field>
          <Field>
            <Label htmlFor="pos">Part of speech</Label>
            <Input
              id="pos"
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              placeholder="noun"
            />
          </Field>
          <Field>
            <Label htmlFor="pron">Pronunciation</Label>
            <Input
              id="pron"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="/ˌsɛr.ənˈdɪp.ɪ.ti/"
              className="font-mono text-[13px] placeholder:font-mono placeholder:not-italic"
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Caps as="div">Examples</Caps>
          <Rule />
          <ExampleInput examples={examples} onChange={setExamples} />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <Caps as="div">Synonyms</Caps>
            <Rule />
            <TagInput
              tags={synonyms}
              onChange={setSynonyms}
              placeholder="Add a synonym"
            />
          </div>
          <div className="space-y-4">
            <Caps as="div">Antonyms</Caps>
            <Rule />
            <TagInput
              tags={antonyms}
              onChange={setAntonyms}
              placeholder="Add an antonym"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Field>
            <Label htmlFor="etymology">Etymology</Label>
            <Textarea
              id="etymology"
              rows={2}
              value={etymology}
              onChange={(e) => setEtymology(e.target.value)}
              placeholder="Origin and history"
              className="font-display italic text-[15px]"
            />
          </Field>
          <Field>
            <Label htmlFor="mnemonic">Mnemonic</Label>
            <Textarea
              id="mnemonic"
              rows={2}
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="A memory aid"
              className="font-display italic text-[15px]"
            />
          </Field>
        </div>

        <Field>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth remembering"
          />
        </Field>

        <div className="space-y-4">
          <Caps as="div">Tags</Caps>
          <Rule />
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="Add a tag and press Enter"
          />
        </div>

        <Rule />
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} variant="primary" size="lg">
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Save word' : 'Save changes'}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            size="lg"
          >
            Cancel
          </Button>
          {extraActions && <div className="ml-auto">{extraActions}</div>}
        </div>
      </form>
    </div>
  )
}
