'use client'
import { formatCurrency, getCategoryLabel, getRenewalLabel, getCoverageLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Coverage {
  coverageName: string; amount: number; unit: string; isOptional: boolean; category: string | null
}
interface Product {
  id: string; productName: string; category: string; renewalType: string
  paymentPeriod: number; coveragePeriod: number; premiumBase: number
  company: { name: string }; coverages: Coverage[]
}

export function CompareTable({ products }: { products: Product[] }) {
  // 모든 보장 항목명 수집 (비특약만)
  const allCoverageNames = [
    ...new Set(
      products.flatMap((p) =>
        p.coverages.filter((c) => !c.isOptional).map((c) => c.coverageName)
      )
    ),
  ]

  // 상품별 보장 맵
  const coverageMap = products.map((p) =>
    Object.fromEntries(
      p.coverages.filter((c) => !c.isOptional).map((c) => [c.coverageName, c])
    )
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="text-left px-4 py-3 font-medium min-w-36">보장 항목</th>
            {products.map((p) => (
              <th key={p.id} className="px-4 py-3 text-center min-w-40">
                <div className="text-xs text-blue-300 mb-0.5">{p.company.name}</div>
                <div className="font-semibold text-sm leading-tight">{p.productName}</div>
              </th>
            ))}
          </tr>
          {/* 기본 정보 행 */}
          <tr className="bg-slate-800 text-slate-200 text-xs">
            <td className="px-4 py-2 font-medium">납입/보장/유형</td>
            {products.map((p) => (
              <td key={p.id} className="px-4 py-2 text-center">
                {p.paymentPeriod}년납 / {getCoverageLabel(p.coveragePeriod)} / {getRenewalLabel(p.renewalType)}
              </td>
            ))}
          </tr>
          <tr className="bg-slate-800 text-slate-200 text-xs border-b-2 border-slate-600">
            <td className="px-4 py-2 font-medium">기준 월납보험료</td>
            {products.map((p) => (
              <td key={p.id} className="px-4 py-2 text-center font-semibold text-blue-300">
                {formatCurrency(p.premiumBase)}~
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {allCoverageNames.map((name, rowIdx) => {
            const amounts = coverageMap.map((m) => m[name])
            const maxAmount = Math.max(...amounts.filter(Boolean).map((c) => c!.amount))

            return (
              <tr
                key={name}
                className={cn(
                  'border-b border-slate-100',
                  rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                )}
              >
                <td className="px-4 py-3 text-slate-700 font-medium">{name}</td>
                {amounts.map((cov, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 text-center">
                    {cov ? (
                      <span className={cn(
                        'font-semibold',
                        cov.amount === maxAmount && maxAmount > 0
                          ? 'text-blue-600'
                          : 'text-slate-700'
                      )}>
                        {formatCurrency(cov.amount)}
                        {cov.unit !== '원' && <span className="text-xs text-slate-400">/{cov.unit}</span>}
                        {cov.amount === maxAmount && maxAmount > 0 && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">최고</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
