'use client'
import { useState } from 'react'
import { X, Loader2, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string; productName: string; premiumBase: number
  company: { name: string }
}

interface ProposalBuilderProps {
  products: Product[]
  onClose: () => void
}

export function ProposalBuilder({ products, onClose }: ProposalBuilderProps) {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [clientAge, setClientAge] = useState(35)
  const [clientGender, setClientGender] = useState<'M' | 'F'>('M')
  const [occupation, setOccupation] = useState('')
  const [healthCondition, setHealthCondition] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName, clientAge, clientGender, occupation, healthCondition,
          productIds: products.map((p) => p.id),
          title: `${clientName}님 보험 비교 제안서`,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '제안서 생성 실패'); return }

      router.push(`/proposals/${data.id}`)
      onClose()
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">고객 제안서 생성</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Bot size={12} className="text-indigo-500" />
                고객 정보 입력 시 AI가 자동으로 추천 점수를 분석합니다
              </p>
            </div>
            <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
          </div>

          {/* 선택 상품 확인 */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5">
            <div className="text-xs text-slate-500 mb-2">선택 상품 ({products.length}개)</div>
            {products.map((p) => (
              <div key={p.id} className="text-sm text-slate-700">
                · {p.company.name} {p.productName}
              </div>
            ))}
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* 고객명 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                고객명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="홍길동"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 나이 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">나이</label>
                <input
                  type="number" min={0} max={99} value={clientAge}
                  onChange={(e) => setClientAge(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">성별</label>
                <div className="flex gap-2">
                  {[{ v: 'M', l: '남성' }, { v: 'F', l: '여성' }].map(({ v, l }) => (
                    <button
                      key={v} type="button"
                      onClick={() => setClientGender(v as 'M' | 'F')}
                      className={`flex-1 py-2.5 rounded-lg text-sm border transition ${
                        clientGender === v
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 직업 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                직업 <span className="text-slate-400 font-normal">(AI 추천에 반영)</span>
              </label>
              <input
                type="text" value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="회사원, 자영업자, 전문직 등"
              />
            </div>

            {/* 건강 상태 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">건강 상태</label>
              <select
                value={healthCondition}
                onChange={(e) => setHealthCondition(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안함</option>
                <option value="양호">양호</option>
                <option value="고혈압">고혈압 있음</option>
                <option value="당뇨">당뇨 있음</option>
                <option value="기타 질환">기타 질환</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> AI 분석 중...</>
              ) : (
                <><Bot size={16} /> AI 추천 제안서 생성</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
