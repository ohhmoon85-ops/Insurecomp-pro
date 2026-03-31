import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyConsultationRequest } from '@/lib/kakao-notify'
import { encryptText } from '@/lib/utils'
import { calculatePremium } from '@/lib/calculator'

// 상담 요청 생성
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { proposalId, productId, agentId, clientName, clientPhone, preferredTime } = body

  if (!productId || !agentId || !clientName || !clientPhone || !preferredTime) {
    return Response.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  // 모집인 정보 조회
  const agent = await prisma.user.findUnique({
    where: { id: agentId },
    select: { id: true, name: true, phone: true },
  })
  if (!agent) return Response.json({ error: '모집인을 찾을 수 없습니다.' }, { status: 404 })

  // 상품 정보 조회
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { company: true },
  })
  if (!product) return Response.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 })

  // 상담 요청 생성 (개인정보 인코딩 저장)
  const consultation = await prisma.consultationRequest.create({
    data: {
      proposalId: proposalId || null,
      productId,
      agentId,
      clientName: encryptText(clientName),
      clientPhone: encryptText(clientPhone),
      preferredTime,
      status: 'PENDING',
    },
  })

  // 모집인에게 카카오 알림톡 발송
  if (agent.phone) {
    const premium = calculatePremium(product.premiumBase, {
      age: 35, gender: 'M', paymentPeriod: product.paymentPeriod,
    })
    await notifyConsultationRequest({
      agentPhone: agent.phone,
      agentName: agent.name,
      clientName,
      productName: `${product.company.name} ${product.productName}`,
      premium,
      preferredTime,
      requestedAt: consultation.requestedAt,
    }).catch(console.error)
  }

  return Response.json({
    requestId: consultation.id,
    agentName: agent.name,
    agentPhone: agent.phone ? agent.phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3') : '',
    message: '상담 요청이 접수되었습니다.',
  }, { status: 201 })
}

// 상담 요청 취소 (30분 이내)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const requestId = searchParams.get('id')
  if (!requestId) return Response.json({ error: 'ID 필요' }, { status: 400 })

  const consultation = await prisma.consultationRequest.findUnique({
    where: { id: requestId },
  })
  if (!consultation) return Response.json({ error: '요청을 찾을 수 없습니다.' }, { status: 404 })

  // 30분 초과 확인
  const diffMin = (Date.now() - consultation.requestedAt.getTime()) / 60000
  if (diffMin > 30) {
    return Response.json({ error: '30분이 초과되어 취소가 불가합니다.' }, { status: 400 })
  }

  await prisma.consultationRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })

  return Response.json({ message: '상담 요청이 취소되었습니다.' })
}
