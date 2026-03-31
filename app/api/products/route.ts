import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const companyId = searchParams.get('companyId')

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      ...(companyId ? { companyId } : {}),
    },
    include: {
      company: { select: { id: true, name: true, logoUrl: true, ratingGrade: true } },
      coverages: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return Response.json(products)
}
