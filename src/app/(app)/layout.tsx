import { AppShell } from '@/components/app-shell'
import { requireUser } from '@/lib/session'
import { getNavSummary } from '@/lib/data/dashboard'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const admin = user.email === process.env.ADMIN_EMAIL
  const nav = await getNavSummary(user.id)
  return (
    <AppShell isAdmin={admin} nav={nav}>
      {children}
    </AppShell>
  )
}
