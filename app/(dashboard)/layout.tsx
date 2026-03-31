import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex min-h-screen pb-8">
      <Sidebar user={session.user as any} />
      <main className="flex-1 ml-64 p-6 pb-16">{children}</main>
    </div>
  )
}
