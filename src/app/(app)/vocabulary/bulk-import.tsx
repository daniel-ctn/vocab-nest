'use client'

import { useState, useTransition } from 'react'
import { Loader2, Sparkles, Upload, X } from 'lucide-react'
import { bulkCreateVocabulary } from '@/lib/actions/vocabulary'
import { aiBulkImport } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import { Textarea } from '@/components/ui/input'
import { cn } from '@/lib/cn'

export function BulkImport({ aiEnabled }: { aiEnabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [useAi, setUseAi] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    created: number
    failed: number
  } | null>(null)

  function handleImport() {
    startTransition(async () => {
      try {
        let res: { created: number; failed: number }
        if (useAi) {
          res = await aiBulkImport(raw)
        } else {
          const entries = raw
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
              const parts = line.split('|').map((p) => p.trim())
              const tags = parts[2]
                ? parts[2]
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                : undefined
              return { term: parts[0] ?? '', definition: parts[1] ?? '', tags }
            })
          res = await bulkCreateVocabulary(entries)
        }
        setResult(res)
        if (res.failed === 0) {
          setTimeout(() => {
            setOpen(false)
            setRaw('')
            setResult(null)
          }, 1500)
        }
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Import failed')
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

      {aiEnabled && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setUseAi(false)}
            className={cn(
              'text-[12px] uppercase tracking-[0.14em] font-semibold transition-colors',
              !useAi ? 'text-ink' : 'text-ink-tertiary hover:text-ink'
            )}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setUseAi(true)}
            className={cn(
              'inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] font-semibold transition-colors',
              useAi ? 'text-accent' : 'text-ink-tertiary hover:text-ink'
            )}
          >
            <Sparkles size={12} />
            AI structure
          </button>
        </div>
      )}

      <Marginalia>
        {useAi ? (
          <>Paste any text or messy list — AI will pull out terms and write definitions.</>
        ) : (
          <>
            Paste one word per line. Format:{' '}
            <code className="font-mono text-[12px] not-italic text-ink">
              term | definition | tag1, tag2
            </code>
          </>
        )}
      </Marginalia>

      <Textarea
        rows={8}
        value={raw}
        maxLength={10_000}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={
          useAi
            ? 'Paste a paragraph, a glossary, or a rough list of words…'
            : `serendipity | a happy accident | english, advanced\nephemeral | lasting for a very short time | english\nmellifluous | sweet or musical | english`
        }
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
