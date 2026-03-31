'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Eye, Share2, MessageSquare, Clock } from 'lucide-react'

interface ProposalItem {
  product: { productName: string; company: { name: string } }
}
interface Proposal {
  id: string; clientName: string; clientAge: number | null; title: string | null
  status: string; viewCount: number; shareToken: string; createdAt: Date; updatedAt: Date
  expiresAt: Date | null
  items: ProposalItem[]
  _count: { consultations: number }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '작성중', color: 'bg-slate-100 text-slate-600' },
  SHARED: { label: '공유됨', color: 'bg-blue-100 text-blue-700' },
  VIEWED: { label: '열람', color: 'bg-green-100 text-green-700' },
  PENDING: { label: '상담중', color: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: '완료', color: 'bg-purple-100 text-purple-700' },
}

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
        <div className="text-4xl mb-3">📄</div>
        <h3 className="text-lg font-semibold text-slate-700">제안서가 없습니다</h3>
        <p className="text-slate-400 text-sm mt-1">상품 비교 화면에서 제안서를 생성해보세요.</p>
        <Link
          href="/compare"
          className="mt-4 inline-block bg-blue-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          상품 비교하러 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {proposals.map((p) => {
        const status = STATUS_LABELS[p.status] || STATUS_LABELS.DRAFT
        const isExpired = p.expiresAt && new Date() > new Date(p.expiresAt)

        return (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* 헤더 */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  {isExpired && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">만료됨</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900">
                  {p.title || `${p.clientName}님 제안서`}
                </h3>
                <div className="text-sm text-slate-500 mt-0.5">
                  {p.clientName}님 {p.clientAge ? `(${p.clientAge}세)` : ''}
                </div>

                {/* 상품 목록 */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {item.product.company.name} {item.product.productName}
                    </span>
                  ))}
                  {p.items.length > 3 && (
                    <span className="text-xs text-slate-400">+{p.items.length - 3}개</span>
                  )}
                </div>

                {/* 통계 */}
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye size={13} /> {p.viewCount}회 열람
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={13} /> {p._count.consultations}건 상담요청
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {formatDate(p.createdAt)}
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => copyLink(p.shareToken)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition ${
                    copied === p.shareToken
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  <Share2 size={13} />
                  {copied === p.shareToken ? '복사됨!' : '링크 복사'}
                </button>
                <Link
                  href={`/share/${p.shareToken}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition"
                >
                  <Eye size={13} />
                  미리보기
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
