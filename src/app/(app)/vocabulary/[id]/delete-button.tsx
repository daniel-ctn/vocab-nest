'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteVocabulary } from '@/lib/actions/vocabulary'
import { Button } from '@/components/ui/button'

export function DeleteVocabularyButton({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Delete this entry?')) return
    startTransition(async () => {
      try {
        await deleteVocabulary(id)
        router.push('/vocabulary')
      } catch {
        alert('Failed to delete')
      }
    })
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      variant="danger"
      size="lg"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      Delete
    </Button>
  )
}
