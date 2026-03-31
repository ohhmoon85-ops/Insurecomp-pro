import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'GA_ADMIN') {
    return Response.json({ error: '권한 없음' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: body.isActive },
  })

  return Response.json(product)
}
