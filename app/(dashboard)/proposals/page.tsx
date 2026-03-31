import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProposalList } from '@/components/proposal/ProposalList'

export default async function ProposalsPage() {
  const session = await auth()
  const agentId = (session?.user as any)?.id

  const proposals = await prisma.proposal.findMany({
    where: { agentId },
    include: {
      items: {
        include: { product: { include: { company: { select: { name: true } } } } },
      },
      _count: { select: { consultations: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">제안서 관리</h1>
        <p className="text-slate-500 text-sm mt-1">고객에게 공유한 제안서 현황을 확인하세요</p>
      </div>
      <ProposalList proposals={proposals as any} />
    </div>
  )
}
