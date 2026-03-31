import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProposalViewer } from '@/components/proposal/ProposalViewer'

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const proposal = await prisma.proposal.findUnique({
    where: { shareToken: token },
    include: {
      agent: { select: { id: true, name: true, phone: true, licenseNo: true, ga: { select: { name: true, brandColor: true } } } },
      items: {
        orderBy: { aiRank: 'asc' },
        include: {
          product: {
            include: {
              company: { select: { name: true, ratingGrade: true } },
              coverages: { where: { isOptional: false }, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  })

  if (!proposal) notFound()

  // 만료 확인
  if (proposal.expiresAt && new Date() > proposal.expiresAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pb-10">
        <div className="text-center">
          <div className="text-4xl mb-4">⌛</div>
          <h1 className="text-xl font-bold text-slate-800">만료된 제안서입니다</h1>
          <p className="text-slate-500 mt-2">모집인에게 문의하여 새로운 링크를 받으세요.</p>
        </div>
      </div>
    )
  }

  // 열람 횟수 증가 + 상태 업데이트
  await prisma.proposal.update({
    where: { id: proposal.id },
    data: {
      viewCount: { increment: 1 },
      status: proposal.status === 'SHARED' ? 'VIEWED' : undefined,
    },
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <ProposalViewer proposal={proposal as any} />
    </div>
  )
}
