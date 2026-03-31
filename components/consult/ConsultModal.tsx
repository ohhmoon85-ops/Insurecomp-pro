'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ConsultModalProps {
  productId: string
  productName: string
  agentId: string
  proposalId?: string
  premium?: number
  onClose: () => void
  onComplete: (result: { requestId: string; agentName: string; agentPhone: string }) => void
}

const PREFERRED_TIMES = [
  { value: 'morning', label: '오전 (9~12시)', icon: '🌅' },
  { value: 'afternoon', label: '오후 (12~6시)', icon: '☀️' },
  { value: 'evening', label: '저녁 (6시 이후)', icon: '🌙' },
]

export function ConsultModal({
  productId, productName, agentId, proposalId, premium, onClose, onComplete,
}: ConsultModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [preferredTime, setPreferredTime] = useState('afternoon')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('개인정보 수집·이용에 동의해주세요.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId, agentId, proposalId,
          clientName, clientPhone, preferredTime,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '요청 처리 중 오류가 발생했습니다.')
        return
      }
      onComplete(data)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Bottom Sheet (모바일 친화적)
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">가입 상담 요청</h2>
              <p className="text-sm text-slate-500 mt-0.5">연락처 입력 후 모집인이 연락드립니다</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* 요청 상품 확인 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
            <div className="text-xs text-blue-500 mb-1">요청 상품</div>
            <div className="font-semibold text-blue-900">{productName}</div>
            {premium && (
              <div className="text-sm text-blue-700 mt-0.5">
                예상 보험료: 약 {formatCurrency(premium)} (참고)
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                성함 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="홍길동"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
                pattern="[0-9]{3}-?[0-9]{3,4}-?[0-9]{4}"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 희망 연락 시간 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                희망 연락 시간
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PREFERRED_TIMES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPreferredTime(value)}
                    className={`py-3 rounded-xl text-xs font-medium border transition flex flex-col items-center gap-1 ${
                      preferredTime === value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 개인정보 동의 */}
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">개인정보 수집·이용 동의 (필수)</strong>
                  <br />
                  수집항목: 성명, 연락처 / 목적: 보험 상담 연결 / 보유기간: 상담 완료 후 1년
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? '요청 처리 중...' : '상담 요청하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
