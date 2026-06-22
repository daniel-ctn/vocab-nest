'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  BrainCircuit,
  Loader2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { createGroup, deleteGroup } from '@/lib/actions/groups'
import { Button, ButtonLink } from '@/components/ui/button'
import { Caps } from '@/components/ui/caps'
import { Chapter } from '@/components/ui/chapter'
import { Field, Input, Label, Textarea } from '@/components/ui/input'
import { Marginalia } from '@/components/ui/marginalia'
import { Rule } from '@/components/ui/rule'
import {
  SpecimenDefinition,
  SpecimenList,
  SpecimenTerm,
} from '@/components/ui/specimen'
import { toRoman } from '@/components/ui/roman'
import type { CreateGroupRequest, Group } from '@/lib/contracts'

function GroupRow({
  group,
  onDelete,
}: {
  group: Group
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="group relative">
      <Link
        href={`/groups/${group.id}`}
        className="block transition-colors hover:[&_[data-specimen-term]]:text-accent"
      >
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <SpecimenTerm>{group.name}</SpecimenTerm>
            {group.description && (
              <SpecimenDefinition className="mt-1 line-clamp-2">
                {group.description}
              </SpecimenDefinition>
            )}
          </div>
          <div className="flex items-baseline gap-2 sm:shrink-0">
            <span className="font-display text-[20px] font-semibold tabular-nums text-ink">
              {group.vocabularyCount}
            </span>
            <Caps className="text-ink-tertiary">
              word{group.vocabularyCount !== 1 ? 's' : ''}
            </Caps>
          </div>
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
              href={`/groups/${group.id}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
            >
              <BookOpen size={13} />
              View
            </Link>
            <Link
              href={`/practice?group=${group.id}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-border-subtle"
            >
              <BrainCircuit size={13} />
              Practice
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onDelete(group.id)
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

export function GroupsList({
  groups,
  atLimit,
  isPro,
}: {
  groups: Group[]
  atLimit?: boolean
  isPro?: boolean
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const payload: CreateGroupRequest = {
      name: newName.trim(),
      description: newDesc.trim() || undefined,
    }
    startTransition(async () => {
      try {
        await createGroup(payload)
        setNewName('')
        setNewDesc('')
        setShowForm(false)
        router.refresh()
      } catch {
        alert('Failed to create group')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this group?')) return
    startTransition(async () => {
      try {
        await deleteGroup(id)
        router.refresh()
      } catch {
        alert('Failed to delete')
      }
    })
  }

  return (
    <div className="space-y-10">
      <Chapter
        eyebrow={`Part ${toRoman(3)}`}
        title="Groups"
        subtitle="Organise your vocabulary into collections."
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
              <Button
                onClick={() => setShowForm((v) => !v)}
                variant="primary"
              >
                New group
              </Button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-6">
          <Field>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., GRE Words"
            />
          </Field>
          <Field>
            <Label htmlFor="desc" hint="optional">
              Description
            </Label>
            <Textarea
              id="desc"
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="A short note about this group"
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending} variant="primary">
              {isPending && <Loader2 size={13} className="animate-spin" />}
              Create
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <div className="space-y-5 py-10 text-center">
          <Rule ornament />
          <h3 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-ink">
            No collections yet.
          </h3>
          <p className="mx-auto max-w-sm font-display text-[16px] italic leading-relaxed text-ink-secondary">
            Gather kindred words — a deck for exams, a shelf for a language, a
            page for a project.
          </p>
          <div className="flex justify-center pt-1">
            <Button onClick={() => setShowForm(true)} variant="primary">
              Create your first group
            </Button>
          </div>
          <Rule ornament />
        </div>
      ) : (
        <SpecimenList>
          {groups.map((group) => (
            <GroupRow key={group.id} group={group} onDelete={handleDelete} />
          ))}
        </SpecimenList>
      )}

      {atLimit && (
        <Marginalia className="text-accent">
          You&apos;ve reached the free plan limit.{' '}
          <Link
            href="/upgrade"
            className="not-italic font-semibold text-accent underline decoration-accent decoration-[1.5px] underline-offset-[5px]"
          >
            Upgrade to Pro
          </Link>{' '}
          for unlimited groups.
        </Marginalia>
      )}
    </div>
  )
}
