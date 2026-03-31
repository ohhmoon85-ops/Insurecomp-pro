import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateRecommendations } from '@/lib/recommendation-engine'
import { calculatePremium } from '@/lib/calculator'

// 제안서 목록 조회
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: '인증 필요' }, { status: 401 })

  const proposals = await prisma.proposal.findMany({
    where: { agentId: (session.user as any).id },
    include: {
      items: {
        include: { product: { include: { company: true } } },
      },
      _count: { select: { consultations: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return Response.json(proposals)
}

// 제안서 생성
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: '인증 필요' }, { status: 401 })

  const body = await req.json()
  const { clientName, clientAge, clientGender, productIds, occupation, healthCondition, incomeLevel, title } = body

  if (!clientName || !productIds?.length) {
    return Response.json({ error: '고객명과 상품은 필수입니다.' }, { status: 400 })
  }

  // 상품 조회
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      company: true,
      coverages: { orderBy: { sortOrder: 'asc' } },
    },
  })

  // AI 추천 점수 계산
  let scoredProducts: Awaited<ReturnType<typeof generateRecommendations>> = []
  if (clientAge && clientGender) {
    try {
      scoredProducts = await generateRecommendations(products, {
        age: clientAge,
        gender: clientGender,
        occupation,
        healthCondition,
        incomeLevel,
      })
    } catch (e) {
      console.error('AI 추천 실패:', e)
    }
  }

  // 제안서 생성 (7일 만료)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const proposal = await prisma.proposal.create({
    data: {
      agentId: (session.user as any).id,
      clientName,
      clientAge,
      clientGender,
      title: title || `${clientName}님 보험 제안서`,
      watermark: session.user.name || '',
      status: 'DRAFT',
      expiresAt,
      items: {
        create: productIds.map((pid: string, idx: number) => {
          const scored = scoredProducts.find((s) => s.product.id === pid)
          const product = products.find((p) => p.id === pid)
          const premium = product
            ? calculatePremium(product.premiumBase, {
                age: clientAge || 35,
                gender: clientGender || 'M',
                paymentPeriod: product.paymentPeriod,
              })
            : 0

          return {
            productId: pid,
            sortOrder: idx,
            premium,
            aiScore: scored?.aiScore,
            aiRank: scored?.aiRank,
            aiReason: scored?.aiReason,
          }
        }),
      },
    },
    include: {
      items: { include: { product: { include: { company: true } } } },
    },
  })

  return Response.json(proposal, { status: 201 })
}
