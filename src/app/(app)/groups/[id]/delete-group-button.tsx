'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteGroup } from '@/lib/actions/groups'
import { Button } from '@/components/ui/button'

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
    <Button onClick={handleClick} disabled={isPending} variant="danger">
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      Delete
    </Button>
  )
}
