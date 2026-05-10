import { getCurrentUser } from '@/lib/session'
import { listVocabulary } from '@/lib/data/vocabulary'
import { VocabularyList } from './vocabulary-list'

export default async function VocabularyPage() {
  const user = await getCurrentUser()
  const entries = await listVocabulary(user.id)
  return <VocabularyList entries={entries} />
}
