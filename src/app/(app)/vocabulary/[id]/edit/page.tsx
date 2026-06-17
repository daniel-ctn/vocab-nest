import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import { isAiConfigured } from '@/lib/ai/gemini'
import { getVocabularyWithGroups } from '@/lib/data/vocabulary'
import { listGroups } from '@/lib/data/groups'
import { Caps } from '@/components/ui/caps'
import { Rule } from '@/components/ui/rule'
import { VocabularyForm } from '../../new/vocabulary-form'
import { DeleteVocabularyButton } from '../delete-button'
import { GroupAssignment } from '../group-assignment'

export default async function VocabularyEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const data = await getVocabularyWithGroups(id, user.id)
  if (!data) {
    redirect('/vocabulary')
  }

  const { entry, groupIds } = data
  const [groups, pro] = await Promise.all([listGroups(user.id), isPro(user.id)])
  const canUseAi = isAiConfigured() && pro

  return (
    <div className="space-y-12">
      <VocabularyForm
        mode="edit"
        entry={entry}
        extraActions={<DeleteVocabularyButton id={entry.id} />}
        canUseAi={canUseAi}
      />

      <section className="space-y-4">
        <Caps as="div">Groups</Caps>
        <Rule />
        <GroupAssignment
          vocabularyId={entry.id}
          groups={groups}
          assignedGroupIds={groupIds}
        />
      </section>
    </div>
  )
}
