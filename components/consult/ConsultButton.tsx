'use client'
import { useState } from 'react'
import { ConsultModal } from './ConsultModal'
import { ConsultComplete } from './ConsultComplete'
import { MessageSquare, CheckCircle } from 'lucide-react'

interface ConsultButtonProps {
  productId: string
  productName: string
  agentId: string
  agentName: string
  proposalId?: string
  premium?: number
}

type Step = 'idle' | 'modal' | 'complete'

interface RequestResult {
  requestId: string
  agentName: string
  agentPhone: string
}

export function ConsultButton({
  productId, productName, agentId, agentName, proposalId, premium,
}: ConsultButtonProps) {
  const [step, setStep] = useState<Step>('idle')
  const [result, setResult] = useState<RequestResult | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  function handleComplete(res: RequestResult) {
    setResult(res)
    setRequestId(res.requestId)
    setStep('complete')
  }

  if (step === 'complete' && result) {
    return (
      <ConsultComplete
        requestId={result.requestId}
        agentName={result.agentName}
        agentPhone={result.agentPhone}
        productName={productName}
        onCancel={() => setStep('idle')}
      />
    )
  }

  return (
    <>
      {/* CTA 버튼 */}
      <button
        onClick={() => setStep('modal')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition
          bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
      >
        <MessageSquare size={16} />
        이 상품으로 가입 상담 요청하기
      </button>

      {/* 상담 요청 모달 */}
      {step === 'modal' && (
        <ConsultModal
          productId={productId}
          productName={productName}
          agentId={agentId}
          proposalId={proposalId}
          premium={premium}
          onClose={() => setStep('idle')}
          onComplete={handleComplete}
        />
      )}
    </>
  )
}
