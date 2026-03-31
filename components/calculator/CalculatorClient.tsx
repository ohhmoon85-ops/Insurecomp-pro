'use client'
import { useState, useMemo } from 'react'
import { calculatePremium, simulatePremiumByAge } from '@/lib/calculator'
import { formatCurrency, getCategoryLabel } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Product {
  id: string; productName: string; category: string; premiumBase: number
  paymentPeriod: number; company: { name: string }
  coverages: { coverageName: string; amount: number }[]
}

const COLORS = ['#2563EB', '#0D9488', '#D97706', '#DC2626']

export function CalculatorClient({ products }: { products: Product[] }) {
  const [age, setAge] = useState(35)
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [paymentPeriod, setPaymentPeriod] = useState(20)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    products.slice(0, 3).map((p) => p.id)
  )

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id))

  // 현재 조건의 보험료 계산
  const premiumResults = useMemo(() =>
    selectedProducts.map((p) => ({
      product: p,
      premium: calculatePremium(p.premiumBase, { age, gender, paymentPeriod: p.paymentPeriod }),
    })),
    [selectedProducts, age, gender, paymentPeriod]
  )

  // 연령별 시뮬레이션 데이터 (차트용)
  const chartData = useMemo(() => {
    const ages = [25, 30, 35, 40, 45, 50, 55, 60]
    return ages.map((a) => {
      const row: Record<string, number | string> = { age: `${a}세` }
      selectedProducts.forEach((p) => {
        row[p.productName] = calculatePremium(p.premiumBase, { age: a, gender, paymentPeriod: p.paymentPeriod })
      })
      return row
    })
  }, [selectedProducts, gender])

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* 입력 패널 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">계산 조건 설정</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 나이 슬라이더 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              나이: <span className="text-blue-600 font-bold">{age}세</span>
            </label>
            <input
              type="range" min={20} max={70} step={1} value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>20세</span><span>70세</span>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">성별</label>
            <div className="flex gap-2">
              {[{ value: 'M', label: '남성' }, { value: 'F', label: '여성' }].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setGender(value as 'M' | 'F')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    gender === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 납입 기간 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">납입 기간</label>
            <div className="flex gap-2">
              {[10, 15, 20].map((p) => (
                <button
                  key={p}
                  onClick={() => setPaymentPeriod(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    paymentPeriod === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {p}년납
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 상품 선택 */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">비교할 상품 선택</label>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  selectedProductIds.includes(p.id)
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                }`}
              >
                {p.company.name} {p.productName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 현재 조건 보험료 결과 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">
            {age}세 {gender === 'M' ? '남성' : '여성'} 기준 월납 보험료
          </h2>
          <div className="space-y-3">
            {premiumResults.sort((a, b) => a.premium - b.premium).map(({ product, premium }, idx) => (
              <div key={product.id} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="text-sm text-slate-700">
                    {product.company.name} {product.productName}
                  </div>
                  <div className="text-xs text-slate-400">{getCategoryLabel(product.category)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatCurrency(premium)}</div>
                  <div className="text-xs text-slate-400">월납 (참고)</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            ※ 표준 가이드 보험료입니다. 실제 보험료는 건강상태·직업 등에 따라 다를 수 있습니다.
          </div>
        </div>

        {/* 연령별 보험료 차트 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">연령별 보험료 변화 ({gender === 'M' ? '남성' : '여성'})</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {selectedProducts.map((p, idx) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.productName}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
