'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import {
  addVocabularyToGroup,
  removeVocabularyFromGroup,
} from '@/lib/actions/groups'
import { Marginalia } from '@/components/ui/marginalia'
import { cn } from '@/lib/cn'
import type { Group } from '@/lib/contracts'

export function GroupAssignment({
  vocabularyId,
  groups,
  assignedGroupIds,
}: {
  vocabularyId: string
  groups: Group[]
  assignedGroupIds: string[]
}) {
  const [assigned, setAssigned] = useState<Set<string>>(
    new Set(assignedGroupIds)
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function toggle(groupId: string) {
    const next = new Set(assigned)
    const isAdding = !next.has(groupId)

    if (isAdding) {
      next.add(groupId)
    } else {
      next.delete(groupId)
    }
    setAssigned(next)
    setPendingId(groupId)

    startTransition(async () => {
      try {
        if (isAdding) {
          await addVocabularyToGroup(vocabularyId, groupId)
        } else {
          await removeVocabularyFromGroup(vocabularyId, groupId)
        }
      } catch {
        alert('Failed to update group assignment')
        setAssigned(new Set(assigned))
      } finally {
        setPendingId(null)
      }
    })
  }

  if (groups.length === 0) {
    return (
      <Marginalia>
        No groups yet. Create one from the Groups page.
      </Marginalia>
    )
  }

  return (
    <div className="divide-y divide-rule">
      {groups.map((group) => {
        const isAssigned = assigned.has(group.id)
        return (
          <button
            key={group.id}
            type="button"
            disabled={pendingId === group.id}
            onClick={() => toggle(group.id)}
            className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-border-subtle/40"
          >
            <span
              className={cn(
                'font-display text-[16px]',
                isAssigned
                  ? 'font-semibold text-ink'
                  : 'italic text-ink-secondary'
              )}
            >
              {group.name}
            </span>
            <span className="shrink-0">
              {pendingId === group.id ? (
                <Loader2 size={14} className="animate-spin text-ink-tertiary" />
              ) : isAssigned ? (
                <Check size={14} className="text-accent" />
              ) : (
                <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-tertiary">
                  Add
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
