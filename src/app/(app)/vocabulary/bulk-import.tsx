'use client'

import { useState, useTransition } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { bulkCreateVocabulary } from '@/lib/actions/vocabulary'
import { Button } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { Textarea } from '@/components/ui/input'

export function BulkImport() {
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    created: number
    failed: number
  } | null>(null)

  function handleImport() {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    const entries = lines.map((line) => {
      const parts = line.split('|').map((p) => p.trim())
      const term = parts[0] ?? ''
      const definition = parts[1] ?? ''
      const tags = parts[2]
        ? parts[2]
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined
      return { term, definition, tags }
    })

    startTransition(async () => {
      try {
        const res = await bulkCreateVocabulary(entries)
        setResult(res)
        if (res.failed === 0) {
          setTimeout(() => {
            setOpen(false)
            setRaw('')
            setResult(null)
          }, 1500)
        }
      } catch {
        alert('Import failed')
      }
    })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Upload size={13} />
        Bulk import
      </Button>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <Caps as="div">Bulk import</Caps>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setRaw('')
            setResult(null)
          }}
          className="text-ink-tertiary hover:text-ink"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
      <Rule />
      <Marginalia>
        Paste one word per line. Format:{' '}
        <code className="font-mono text-[12px] not-italic text-ink">
          term | definition | tag1, tag2
        </code>
      </Marginalia>

      <Textarea
        rows={8}
        value={raw}
        maxLength={10_000}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={`serendipity | a happy accident | english, advanced\nephemeral | lasting for a very short time | english\nmellifluous | sweet or musical | english`}
        className="font-mono text-[13px] placeholder:font-mono placeholder:not-italic"
      />

      {result && (
        <Marginalia className={result.failed === 0 ? 'text-success' : 'text-accent'}>
          {result.created} imported
          {result.failed > 0 && `, ${result.failed} failed`}.
        </Marginalia>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleImport}
          disabled={isPending || !raw.trim()}
          variant="primary"
        >
          {isPending && <Loader2 size={13} className="animate-spin" />}
          Import
        </Button>
        <Button
          onClick={() => {
            setRaw('')
            setResult(null)
          }}
          variant="ghost"
        >
          Clear
        </Button>
      </div>
    </section>
  )
}
