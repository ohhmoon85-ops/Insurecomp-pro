import { prisma } from '@/lib/prisma'
import { CompareClient } from '@/components/compare/CompareClient'

export default async function ComparePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      company: { select: { id: true, name: true, logoUrl: true, ratingGrade: true } },
      coverages: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const companies = await prisma.insuranceCompany.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">보험상품 비교</h1>
        <p className="text-slate-500 text-sm mt-1">
          최대 4개 상품을 선택하여 보장 항목을 비교하세요
        </p>
      </div>
      <CompareClient products={products} companies={companies} />
    </div>
  )
}
