'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BarChart3, Calculator, FileText, Settings, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: { name?: string; email?: string; role?: string; gaName?: string }
}

const navItems = [
  { href: '/compare', icon: BarChart3, label: '상품 비교' },
  { href: '/calculator', icon: Calculator, label: '보험료 계산기' },
  { href: '/proposals', icon: FileText, label: '제안서 관리' },
]

const adminItems = [
  { href: '/admin/products', icon: Shield, label: '상품 관리' },
  { href: '/admin/agents', icon: Settings, label: '모집인 관리' },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = user.role === 'GA_ADMIN'

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-40">
      {/* 로고 */}
      <div className="p-6 border-b border-slate-700">
        <div className="text-xs font-mono text-blue-400 mb-1">InsureComp Pro</div>
        <div className="text-lg font-bold">{user.gaName || 'GA 플랫폼'}</div>
      </div>

      {/* 사용자 정보 */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="text-sm font-semibold">{user.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {user.role === 'GA_ADMIN' ? 'GA 관리자' : '보험 모집인'}
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
              pathname.startsWith(href)
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 text-xs font-mono text-slate-500 uppercase tracking-wider px-3">
              관리자
            </div>
            {adminItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
                  pathname.startsWith(href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* 로그아웃 */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
