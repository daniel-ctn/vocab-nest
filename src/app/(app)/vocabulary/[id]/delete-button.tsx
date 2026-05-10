'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteVocabulary } from '@/lib/actions/vocabulary'

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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-error-subtle text-error text-sm font-medium hover:bg-error/10 transition-colors disabled:opacity-60"
    >
      <Trash2 size={16} />
      Delete
    </button>
  )
}
