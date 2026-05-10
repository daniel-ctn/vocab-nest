import { getCurrentUser } from '@/lib/session'
import { listGroups } from '@/lib/data/groups'
import { GroupsList } from './groups-list'

export default async function GroupsPage() {
  const user = await getCurrentUser()
  const groups = await listGroups(user.id)
  return <GroupsList groups={groups} />
}
