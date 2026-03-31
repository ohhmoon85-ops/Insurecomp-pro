'use client'
import { useState } from 'react'
import { formatCurrency, getCategoryLabel, getRenewalLabel, getCoverageLabel } from '@/lib/utils'
import { ConsultButton } from '@/components/consult/ConsultButton'
import { Bot, Shield, Phone } from 'lucide-react'

interface Coverage { coverageName: string; amount: number; unit: string; category: string | null }
interface Product {
  id: string; productName: string; category: string; renewalType: string
  paymentPeriod: number; coveragePeriod: number
  company: { name: string; ratingGrade: string | null }
  coverages: Coverage[]
}
interface ProposalItem {
  id: string; premium: number | null; aiScore: number | null; aiRank: number | null; aiReason: string | null
  product: Product
}
interface Agent {
  id: string; name: string; phone: string | null; licenseNo: string | null
  ga: { name: string; brandColor: string } | null
}
interface Proposal {
  id: string; clientName: string; clientAge: number | null; clientGender: string | null
  title: string | null; watermark: string | null; aiAnalysis: string | null
  agent: Agent; items: ProposalItem[]
}

export function ProposalViewer({ proposal }: { proposal: Proposal }) {
  const ga = proposal.agent.ga
  const brandColor = ga?.brandColor || '#2563EB'
  const hasAI = proposal.items.some((i) => i.aiScore !== null)

  return (
    <div>
      {/* GA 헤더 */}
      <div style={{ backgroundColor: brandColor }} className="text-white px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-sm opacity-75 mb-1">{ga?.name || 'InsureComp Pro'}</div>
          <h1 className="text-xl font-bold">{proposal.title || `${proposal.clientName}님 보험 제안서`}</h1>
          <div className="text-sm opacity-80 mt-1">
            {proposal.clientAge && `${proposal.clientAge}세 `}
            {proposal.clientGender === 'M' ? '남성' : proposal.clientGender === 'F' ? '여성' : ''}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* AI 맞춤 분석 배너 */}
        {hasAI && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={18} className="text-indigo-600" />
              <span className="font-semibold text-indigo-800 text-sm">AI 맞춤 분석</span>
            </div>
            <p className="text-sm text-indigo-700">
              고객님의 나이·성별·건강 상태를 종합 분석하여 최적의 상품을 추천해 드렸습니다.
              아래 순위는 AI가 산출한 종합 점수 기준입니다.
            </p>
          </div>
        )}

        {/* 상품 카드 목록 */}
        {proposal.items
          .sort((a, b) => (a.aiRank || 99) - (b.aiRank || 99))
          .map((item, idx) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* 카드 헤더 */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    {item.aiRank && (
                      <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mb-1.5 font-medium">
                        <Bot size={11} />
                        AI 추천 {item.aiRank}위
                      </span>
                    )}
                    <div className="text-xs text-slate-500">{item.product.company.name}</div>
                    <h3 className="font-bold text-slate-900">{item.product.productName}</h3>
                  </div>
                  <div className="text-right">
                    {item.aiScore !== null && (
                      <div className="text-2xl font-bold text-indigo-600">{item.aiScore.toFixed(0)}</div>
                    )}
                    {item.aiScore !== null && (
                      <div className="text-xs text-slate-400">종합점수</div>
                    )}
                  </div>
                </div>

                {/* 항목별 점수 바 */}
                {item.aiScore !== null && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: '보장범위', score: Math.min(100, item.aiScore * 1.1) },
                      { label: '보험료 적정', score: Math.max(0, 100 - item.aiScore * 0.3) },
                      { label: '갱신 안정성', score: item.product.renewalType === 'NON_RENEWABLE' ? 95 : 60 },
                    ].map(({ label, score }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-medium text-indigo-600">{Math.round(score)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 rounded-full"
                            style={{ width: `${Math.round(score)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 보장 목록 */}
              <div className="px-5 py-3">
                <div className="space-y-2">
                  {item.product.coverages.slice(0, 5).map((cov, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{cov.coverageName}</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(cov.amount)}{cov.unit !== '원' ? `/${cov.unit}` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* AI 추천 이유 */}
                {item.aiReason && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bot size={13} className="text-indigo-500" />
                      <span className="text-xs font-semibold text-indigo-700">AI 추천 이유</span>
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">{item.aiReason}</p>
                  </div>
                )}

                {/* 상품 정보 */}
                <div className="flex gap-3 mt-3 text-xs text-slate-400">
                  <span>{item.product.paymentPeriod}년납</span>
                  <span>보장 {getCoverageLabel(item.product.coveragePeriod)}</span>
                  <span>{getRenewalLabel(item.product.renewalType)}</span>
                  {item.product.company.ratingGrade && (
                    <span className="text-green-600">등급 {item.product.company.ratingGrade}</span>
                  )}
                </div>

                {/* 보험료 */}
                {item.premium && (
                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">예상 월납보험료</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(item.premium)}
                        <span className="text-xs font-normal text-slate-400 ml-1">참고</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 🔑 핵심 CTA: 이 상품으로 가입 상담 요청 버튼 (섹션 13) */}
              <div className="px-5 pb-5">
                <ConsultButton
                  productId={item.product.id}
                  productName={`${item.product.company.name} ${item.product.productName}`}
                  agentId={proposal.agent.id}
                  agentName={proposal.agent.name}
                  proposalId={proposal.id}
                  premium={item.premium || undefined}
                />
              </div>
            </div>
          ))}

        {/* 담당 모집인 정보 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <Shield size={20} className="text-slate-500" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{proposal.agent.name} 모집인</div>
              <div className="text-sm text-slate-500">{ga?.name}</div>
              {proposal.agent.licenseNo && (
                <div className="text-xs text-slate-400 mt-0.5">등록번호: {proposal.agent.licenseNo}</div>
              )}
              {proposal.agent.phone && (
                <a
                  href={`tel:${proposal.agent.phone}`}
                  className="flex items-center gap-1 text-sm text-blue-600 mt-2"
                >
                  <Phone size={14} />
                  {proposal.agent.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* AI 면책 고지 */}
        <div className="text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100 p-4">
          <Bot size={14} className="inline mr-1 text-slate-300" />
          AI 추천 결과는 참고 자료이며 최종 보험료는 상담을 통해 확인하시기 바랍니다.
          <br />본 비교 자료는 보험업법 등 관계 법령에 의거한 정보 제공을 목적으로 합니다.
        </div>

        {/* 워터마크 */}
        {proposal.watermark && (
          <div className="text-center text-xs text-slate-300">
            InsureComp Pro · {proposal.watermark} · {new Date().toLocaleDateString('ko-KR')}
          </div>
        )}
      </div>
    </div>
  )
}
