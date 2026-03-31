'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, MessageCircle, X, Clock } from 'lucide-react'

interface ConsultCompleteProps {
  requestId: string
  agentName: string
  agentPhone: string
  productName: string
  onCancel: () => void
}

export function ConsultComplete({
  requestId, agentName, agentPhone, productName, onCancel,
}: ConsultCompleteProps) {
  const [canCancel, setCanCancel] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState(30)

  // 30분 카운트다운
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 60000
      const left = Math.max(0, 30 - elapsed)
      setMinutesLeft(Math.ceil(left))
      if (left <= 0) {
        setCanCancel(false)
        clearInterval(interval)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch(`/api/consultation?id=${requestId}`, { method: 'DELETE' })
      if (res.ok) {
        setCancelled(true)
        setTimeout(onCancel, 2000)
      }
    } finally {
      setCancelling(false)
    }
  }

  if (cancelled) {
    return (
      <div className="text-center py-6 px-4 bg-slate-50 rounded-xl">
        <div className="text-3xl mb-2">✓</div>
        <p className="text-sm text-slate-600">상담 요청이 취소되었습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
      {/* 완료 헤더 */}
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle size={24} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-green-800">상담 요청 완료!</h3>
          <p className="text-sm text-green-700 mt-0.5">
            담당 모집인이 곧 연락드릴 예정입니다.
          </p>
        </div>
      </div>

      {/* 담당 모집인 정보 */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-2 border border-green-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">요청 상품</span>
          <span className="font-medium text-slate-800 text-right max-w-48 leading-tight">{productName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">담당 모집인</span>
          <span className="font-medium text-slate-800">{agentName}</span>
        </div>
        {agentPhone && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">연락처</span>
            <span className="font-medium text-slate-800">{agentPhone}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">예상 연락 시간</span>
          <span className="font-medium text-green-700">영업일 기준 당일~익일</span>
        </div>
      </div>

      {/* 카카오채널 버튼 */}
      <div className="flex flex-col gap-2">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-yellow-900 transition">
          <MessageCircle size={16} />
          카카오채널로 바로 문의하기
        </button>

        {/* 30분 이내 취소 */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 transition"
          >
            <Clock size={13} />
            {cancelling ? '취소 처리 중...' : `${minutesLeft}분 이내 요청 취소 가능`}
          </button>
        )}
      </div>
    </div>
  )
}
