'use client'
import { formatCurrency, getCategoryLabel, getRenewalLabel, getCoverageLabel } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Coverage {
  id: string; coverageName: string; amount: number; unit: string
  isOptional: boolean; category: string | null
}
interface Product {
  id: string; productName: string; category: string
  premiumBase: number; renewalType: string; paymentPeriod: number; coveragePeriod: number
  company: { name: string; logoUrl: string | null; ratingGrade: string | null }
  coverages: Coverage[]
}

const CATEGORY_COLORS: Record<string, string> = {
  CI: 'border-blue-500', HEALTH: 'border-teal-500', LIFE: 'border-purple-500',
  ACCIDENT: 'border-amber-500', SAVINGS: 'border-green-500',
}

export function ProductCard({ product, isSelected, onToggle, disabled }: {
  product: Product; isSelected: boolean; onToggle: () => void; disabled: boolean
}) {
  const keyCoverages = product.coverages.filter((c) => !c.isOptional).slice(0, 3)

  return (
    <div className={cn(
      'bg-white rounded-xl border-2 transition shadow-sm hover:shadow-md',
      isSelected ? 'border-blue-500 ring-2 ring-blue-100' : CATEGORY_COLORS[product.category] || 'border-slate-200'
    )}>
      <div className="p-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={cn(
              'inline-block text-xs font-medium px-2 py-0.5 rounded mb-1',
              'bg-blue-50 text-blue-700 border border-blue-200'
            )}>
              {getCategoryLabel(product.category)}
            </span>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">
              {product.company.name}
            </h3>
            <p className="text-slate-700 font-medium mt-0.5">{product.productName}</p>
          </div>
          {product.company.ratingGrade && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded">
              {product.company.ratingGrade}
            </span>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="grid grid-cols-3 gap-2 text-center my-3 p-3 bg-slate-50 rounded-lg">
          <div>
            <div className="text-xs text-slate-500">납입</div>
            <div className="text-sm font-semibold text-slate-800">{product.paymentPeriod}년납</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">보장</div>
            <div className="text-sm font-semibold text-slate-800">{getCoverageLabel(product.coveragePeriod)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">유형</div>
            <div className="text-sm font-semibold text-slate-800">{getRenewalLabel(product.renewalType)}</div>
          </div>
        </div>

        {/* 주요 보장 */}
        <div className="space-y-1.5 mb-4">
          {keyCoverages.map((cov) => (
            <div key={cov.id} className="flex justify-between text-sm">
              <span className="text-slate-600 truncate">{cov.coverageName}</span>
              <span className="font-semibold text-blue-700 ml-2 shrink-0">
                {formatCurrency(cov.amount)}{cov.unit !== '원' ? `/${cov.unit}` : ''}
              </span>
            </div>
          ))}
          {product.coverages.length > 3 && (
            <div className="text-xs text-slate-400">+{product.coverages.length - 3}개 보장 항목</div>
          )}
        </div>

        {/* 기준 보험료 */}
        <div className="border-t pt-3 mb-3">
          <div className="text-xs text-slate-400">30세 남성 기준</div>
          <div className="text-lg font-bold text-slate-900">
            월 {formatCurrency(product.premiumBase)}
            <span className="text-xs font-normal text-slate-400 ml-1">~(참고)</span>
          </div>
        </div>

        {/* 선택 버튼 */}
        <button
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            'w-full py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2',
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : disabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
          )}
        >
          {isSelected ? (
            <><Check size={16} /> 비교 중</>
          ) : (
            <><Plus size={16} /> 비교 추가</>
          )}
        </button>
      </div>
    </div>
  )
}
