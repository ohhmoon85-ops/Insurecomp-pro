'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Package, Users, BarChart2, LogOut, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  user: { name?: string; role?: string; gaName?: string }
}

const adminNav = [
  { href: '/admin/products', icon: Package, label: '상품 관리' },
  { href: '/admin/agents', icon: Users, label: '모집인 관리' },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-40">
      <div className="p-6 border-b border-slate-700">
        <div className="text-xs font-mono text-red-400 mb-1">GA ADMIN</div>
        <div className="text-lg font-bold">{user.gaName || 'InsureComp Pro'}</div>
      </div>
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="text-sm font-semibold">{user.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">GA 관리자</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminNav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
              pathname === href ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            )}
          >
            <Icon size={18} />{label}
          </Link>
        ))}
        <div className="pt-4">
          <Link href="/compare" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition">
            <ArrowLeft size={18} />모집인 화면으로
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition"
        >
          <LogOut size={18} />로그아웃
        </button>
      </div>
    </aside>
  )
}
