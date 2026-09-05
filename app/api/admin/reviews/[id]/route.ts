import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireAuth,
  requireAdmin,
  jsonError,
} from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(requireAuth(request))

    await prisma.reviewLike.deleteMany({ where: { reviewId: params.id } })
    await prisma.review.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Review deleted' })
  } catch (error) {
    return jsonError(error)
  }
}
