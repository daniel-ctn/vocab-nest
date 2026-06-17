import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import { isAiConfigured } from '@/lib/ai/gemini'
import { VocabularyForm } from './vocabulary-form'

export default async function NewVocabularyPage() {
  const user = await requireUser()
  const canUseAi = isAiConfigured() && (await isPro(user.id))
  return <VocabularyForm mode="create" canUseAi={canUseAi} />
}
