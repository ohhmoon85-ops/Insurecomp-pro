'use client'
import { useState } from 'react'
import { getCategoryLabel, getRenewalLabel, formatCurrency } from '@/lib/utils'
import { Package, ToggleLeft, ToggleRight } from 'lucide-react'

interface Product {
  id: string; productName: string; category: string; renewalType: string
  premiumBase: number; isActive: boolean; paymentPeriod: number
  company: { name: string }
  _count: { coverages: number; proposalItems: number }
}
interface Company { id: string; name: string }

export function ProductManage({ products, companies }: { products: Product[]; companies: Company[] }) {
  const [items, setItems] = useState(products)

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p))
    }
  }

  return (
    <div className="space-y-3">
      {items.map((product) => (
        <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Package size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{product.productName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {product.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {product.company.name} · {getCategoryLabel(product.category)} · {getRenewalLabel(product.renewalType)}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  <span>납입 {product.paymentPeriod}년</span>
                  <span>기준보험료 {formatCurrency(product.premiumBase)}</span>
                  <span>보장항목 {product._count.coverages}개</span>
                  <span>제안서 사용 {product._count.proposalItems}건</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleActive(product.id, product.isActive)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 transition"
            >
              {product.isActive
                ? <ToggleRight size={18} className="text-green-500" />
                : <ToggleLeft size={18} className="text-slate-400" />
              }
              {product.isActive ? '비활성화' : '활성화'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
