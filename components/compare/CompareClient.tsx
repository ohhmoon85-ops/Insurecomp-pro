'use client'
import { useState } from 'react'
import { useCompareStore } from '@/store/compareStore'
import { ProductCard } from './ProductCard'
import { CompareTable } from './CompareTable'
import { ProposalBuilder } from '@/components/proposal/ProposalBuilder'
import { formatCurrency, getCategoryLabel, getRenewalLabel, getCoverageLabel } from '@/lib/utils'

interface Company { id: string; name: string }
interface Coverage {
  id: string; coverageName: string; amount: number; unit: string
  isOptional: boolean; riderPremium: number | null; category: string | null
}
interface Product {
  id: string; productName: string; category: string
  premiumBase: number; renewalType: string; paymentPeriod: number; coveragePeriod: number
  company: { id: string; name: string; logoUrl: string | null; ratingGrade: string | null }
  coverages: Coverage[]
}

const CATEGORIES = [
  { value: '', label: '전체' }, { value: 'CI', label: 'CI보험' },
  { value: 'HEALTH', label: '건강보험' }, { value: 'LIFE', label: '종신보험' },
  { value: 'ACCIDENT', label: '상해보험' },
]

export function CompareClient({ products, companies }: { products: Product[]; companies: Company[] }) {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [showProposalBuilder, setShowProposalBuilder] = useState(false)
  const { selectedProducts, addProduct, removeProduct, isSelected } = useCompareStore()

  const filtered = products.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false
    if (companyFilter && p.company.id !== companyFilter) return false
    return true
  })

  return (
    <div>
      {/* 필터 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategoryFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                categoryFilter === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="ml-auto border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">보험사 전체</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 비교 선택 바 */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-700 font-medium">
              {selectedProducts.length}개 선택됨
            </span>
            <div className="flex gap-2">
              {selectedProducts.map((p) => (
                <span key={p.id} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {p.company.name} {p.productName}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProposalBuilder(true)}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              제안서 생성
            </button>
          </div>
        </div>
      )}

      {/* 상품 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={isSelected(product.id)}
            onToggle={() =>
              isSelected(product.id) ? removeProduct(product.id) : addProduct(product)
            }
            disabled={!isSelected(product.id) && selectedProducts.length >= 4}
          />
        ))}
      </div>

      {/* 비교 테이블 */}
      {selectedProducts.length >= 2 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            보장 항목 비교 ({selectedProducts.length}개 상품)
          </h2>
          <CompareTable products={selectedProducts} />
        </div>
      )}

      {/* 제안서 생성 모달 */}
      {showProposalBuilder && (
        <ProposalBuilder
          products={selectedProducts}
          onClose={() => setShowProposalBuilder(false)}
        />
      )}
    </div>
  )
}
