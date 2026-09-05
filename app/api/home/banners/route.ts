import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, jsonError } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

/**
 * Mobile home banners (USER-safe).
 * Returns active banners only, ordered by position.
 */
export async function GET(request: NextRequest) {
  try {
    requireAuth(request)

    const now = new Date()

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: now } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        image: true,
        link: true,
        position: true,
        isActive: true,
      },
    })

    // Normalize for mobile carousel (title may be null in DB)
    const payload = banners.map((b) => ({
      id: b.id,
      _id: b.id,
      title: b.title || '',
      image: b.image,
      description: b.link || undefined,
      isActive: b.isActive,
      order: b.position,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    return jsonError(error)
  }
}
