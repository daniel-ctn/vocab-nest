'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
  BookOpen,
  BrainCircuit,
} from 'lucide-react'
import { createGroup, deleteGroup } from '@/lib/actions/groups'
import type { CreateGroupRequest, Group } from '@/lib/contracts'

function GroupCard({
  group,
  onDelete,
}: {
  group: Group
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="group relative p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/groups/${group.id}`}
          className="text-left flex-1 min-w-0"
        >
          <h3 className="font-display text-lg font-semibold text-ink truncate">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-sm text-ink-secondary mt-1 line-clamp-2">
              {group.description}
            </p>
          )}
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
                  href={`/groups/${group.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-border-subtle"
                >
                  <BookOpen size={14} />
                  View
                </Link>
                <Link
                  href={`/practice?group=${group.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-border-subtle"
                >
                  <BrainCircuit size={14} />
                  Practice
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(group.id)
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
      <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-secondary">
        <BookOpen size={12} />
        {group.vocabularyCount} word{group.vocabularyCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export function GroupsList({ groups }: { groups: Group[] }) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Groups
          </h1>
          <p className="text-ink-secondary mt-1">
            Organize your vocabulary into collections.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          New group
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-xl bg-surface border border-border space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Name
            </label>
            <input
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-cream border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="e.g., GRE Words"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Description
            </label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-cream border border-border text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="Optional description"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-ink-secondary hover:bg-border-subtle transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-secondary">No groups yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-accent hover:underline"
          >
            <Plus size={14} />
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
