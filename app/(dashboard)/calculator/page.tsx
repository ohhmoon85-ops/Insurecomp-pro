import { prisma } from '@/lib/prisma'
import { CalculatorClient } from '@/components/calculator/CalculatorClient'

export default async function CalculatorPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      company: { select: { name: true } },
      coverages: { where: { isOptional: false }, orderBy: { sortOrder: 'asc' }, take: 3 },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">보험료 계산기</h1>
        <p className="text-slate-500 text-sm mt-1">
          나이·성별을 입력하면 보험사별 가이드 보험료를 즉시 비교합니다
        </p>
      </div>
      <CalculatorClient products={products} />
    </div>
  )
}
