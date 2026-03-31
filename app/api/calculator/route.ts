import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePremium, simulatePremiumByAge } from '@/lib/calculator'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { age, gender, paymentPeriod, productIds, includeOptional } = body

  if (!age || !gender || !paymentPeriod || !productIds?.length) {
    return Response.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: {
      company: { select: { name: true } },
      coverages: { orderBy: { sortOrder: 'asc' } },
    },
  })

  const results = products.map((product) => {
    const optionalRiders = includeOptional
      ? product.coverages.filter((c) => c.isOptional).map((c) => c.riderPremium || 0)
      : []

    const premium = calculatePremium(
      product.premiumBase,
      { age, gender, paymentPeriod: product.paymentPeriod },
      optionalRiders
    )

    const simulation = simulatePremiumByAge(product.premiumBase, gender, product.paymentPeriod)

    return {
      productId: product.id,
      productName: product.productName,
      companyName: product.company.name,
      monthlyPremium: premium,
      annualPremium: premium * 12,
      totalPaid: premium * product.paymentPeriod * 12,
      simulation,
    }
  })

  return Response.json(results)
}
