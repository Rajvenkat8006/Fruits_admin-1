import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    requireAdmin(requireAuth(request))

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    return jsonError(error)
  }
}
