'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteGroup } from '@/lib/actions/groups'

export function DeleteGroupButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Delete this group?')) return
    startTransition(async () => {
      try {
        await deleteGroup(id)
        router.push('/groups')
      } catch {
        alert('Failed to delete group')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-error-subtle text-error text-sm font-medium hover:bg-error/10 transition-colors disabled:opacity-60"
    >
      <Trash2 size={14} />
      Delete group
    </button>
  )
}
