import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getVocabulary } from '@/lib/data/vocabulary'
import { VocabularyForm } from '../new/vocabulary-form'
import { DeleteVocabularyButton } from './delete-button'

export default async function VocabularyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  const entry = await getVocabulary(id, user.id)
  if (!entry) {
    redirect('/vocabulary')
  }

  return (
    <VocabularyForm
      mode="edit"
      entry={entry}
      extraActions={<DeleteVocabularyButton id={entry.id} />}
    />
  )
}
