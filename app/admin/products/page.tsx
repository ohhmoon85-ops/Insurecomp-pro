import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/ui/AdminSidebar'
import { ProductManage } from '@/components/admin/ProductManage'

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'GA_ADMIN') redirect('/compare')

  const products = await prisma.product.findMany({
    include: {
      company: { select: { name: true } },
      _count: { select: { coverages: true, proposalItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const companies = await prisma.insuranceCompany.findMany({
    select: { id: true, name: true },
  })

  return (
    <div className="flex min-h-screen pb-8">
      <AdminSidebar user={session.user as any} />
      <main className="flex-1 ml-64 p-6 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">상품 관리</h1>
          <p className="text-slate-500 text-sm mt-1">보험 상품 데이터를 관리합니다</p>
        </div>
        <ProductManage products={products as any} companies={companies} />
      </main>
    </div>
  )
}
